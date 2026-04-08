import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

const MAPS_WRAPPER_URL = 'http://localhost:3005';
const ARRIVAL_TIMING_URL = 'http://localhost:3013';
const ROUTE_CACHE_URL = 'http://localhost:3010';
const NOTIFICATION_URL = 'http://localhost:3006';

@Injectable()
export class RoutePlannerOrchestratorServiceService {
  constructor(
    private readonly httpService: HttpService,
    @Inject('RABBITMQ_CLIENT') private readonly rabbitClient: ClientProxy,
  ) {}

  private mapMode(mode: string, line_or_service: string | null): string {
    if (mode === 'WALKING') return 'WALK';
    if (mode === 'TRANSIT') {
      if (line_or_service && /^\d+[A-Z]?$/.test(line_or_service)) return 'BUS';
      return 'MRT';
    }
    return 'WALK';
  }

  private mapMainMode(mainMode: string): string {
    if (mainMode === 'WALKING') return 'WALK';
    if (['SUBWAY', 'BUS', 'RAIL', 'TRAM', 'MRT'].includes(mainMode)) return 'PUBLIC_TRANSPORT';
    return 'PUBLIC_TRANSPORT';
  }

  async searchRoutes(user_id: number, origin: string, destination: string) {
    try {
      const mapsResponse = await firstValueFrom(
        this.httpService.get(`${MAPS_WRAPPER_URL}/maps/routes`, {
          params: { origin, destination },
        }),
      );
      const { options } = mapsResponse.data;

      const enrichedOptions = await Promise.all(
        options.map(async (option: any) => {
          const enrichedSegments = await Promise.all(
            option.segments.map(async (segment: any, segIndex: number) => {
              const mappedMode = this.mapMode(segment.mode, segment.line_or_service);

              const segmentWithId = {
                segment_id: segIndex + 1,
                mode: mappedMode,
                from_stop: segment.from_stop,
                to_stop: segment.to_stop,
                duration_mins: segment.duration_mins,
                distance_km: segment.distance_km,
                line_or_service: segment.line_or_service,
                segment_order: segment.segment_order,
              };

              let arrival_timing = null;
              if (segment.mode === 'TRANSIT' && segment.from_stop && segment.line_or_service) {
                try {
                  const timingResponse = await firstValueFrom(
                    this.httpService.get(`${ARRIVAL_TIMING_URL}/arrival-timing`, {
                      params: {
                        line: segment.line_or_service,
                        stop: segment.from_stop,
                        mode: option.main_mode,
                      },
                    }),
                  );
                  arrival_timing = timingResponse.data;
                } catch {
                  arrival_timing = null;
                }
              }

              return { ...segmentWithId, arrival_timing };
            }),
          );

          const segmentsForCache = enrichedSegments.map(
            ({ arrival_timing, ...rest }) => rest,
          );

          return {
            option_id: option.option_id,
            summary: option.summary,
            total_duration_mins: option.total_duration_mins,
            total_distance_km: option.total_distance_km,
            transfer_count: option.transfer_count,
            main_mode: this.mapMainMode(option.main_mode),
            is_public_transport: option.is_public_transport,
            segments: enrichedSegments,
            segments_for_cache: segmentsForCache,
          };
        }),
      );

      const route_id = Date.now();

      const routeOptionsForCache = enrichedOptions.map(
        ({ segments_for_cache, segments, ...rest }) => ({
          ...rest,
          segments: segments_for_cache,
        }),
      );

      await firstValueFrom(
        this.httpService.post(`${ROUTE_CACHE_URL}/route-cache`, {
          route_id,
          user_id,
          origin_label: origin,
          destination_label: destination,
          route_payload_json: { source: 'google-maps' },
          selected_option_id: null,
          is_locked: false,
          search_status: 'GENERATED',
          route_options: routeOptionsForCache,
        }),
      );

      const optionsForFrontend = enrichedOptions.map(
        ({ segments_for_cache, ...rest }) => rest,
      );

      return {
        route_id,
        user_id,
        origin_label: origin,
        destination_label: destination,
        options: optionsForFrontend,
      };
    } catch (error) {
      console.error('searchRoutes error:', error?.response?.data ?? error);
      throw new InternalServerErrorException('Failed to search routes');
    }
  }

  async selectRoute(route_id: number, option_id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${ROUTE_CACHE_URL}/route-cache/select-option`,
          null,
          { params: { route_id, option_id } },
        ),
      );
      return response.data;
    } catch (error) {
      console.error('selectRoute error:', error?.response?.data ?? error);
      throw new InternalServerErrorException('Failed to select route');
    }
  }

  async getRoutes(user_id: number, origin: string, destination: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${ROUTE_CACHE_URL}/route-cache`, {
          params: { user_id, origin, destination },
        }),
      );
      return response.data;
    } catch (error) {
      console.error('getRoutes error:', error?.response?.data ?? error);
      throw new InternalServerErrorException('Failed to get routes');
    }
  }

  async handleDisruption(route_id: number, disrupted_line: string) {
    try {
      const routeResponse = await firstValueFrom(
        this.httpService.get(`${ROUTE_CACHE_URL}/route-cache/by-route-id`, {
          params: { route_id },
        }),
      ) as any;
      const route = routeResponse.data;

      const affectedOption = route.route_options?.find(
        (opt: any) => opt.option_id === route.selected_option_id,
      );

      const usesDisruptedLine = affectedOption?.segments?.some(
        (seg: any) => seg.line_or_service === disrupted_line,
      );

      if (!usesDisruptedLine) {
        return {
          message: `Route ${route_id} does not use ${disrupted_line} — no action needed`,
          affected: false,
        };
      }

      await firstValueFrom(
        this.httpService.patch(
          `${ROUTE_CACHE_URL}/route-cache/disrupt`,
          null,
          { params: { route_id } },
        ),
      );

      (this.rabbitClient as any).emit('route.disrupted', {
        route_id,
        user_id: route.user_id,
        disrupted_line,
        message: `Your locked route uses ${disrupted_line} which is currently disrupted. Please re-search for alternative routes.`,
      });

      try {
        await firstValueFrom(
          this.httpService.post(
            `${NOTIFICATION_URL}/notification-service/notifications`,
            {
              userId: String(route.user_id),
              type: 'route_disruption',
              title: `${disrupted_line} Line Disrupted`,
              message: `Your locked route uses the ${disrupted_line} line which is currently disrupted. Please re-search for an alternative route.`,
              isRead: false,
            },
          ),
        );
      } catch (notifError) {
        console.warn('Notification HTTP call failed, RabbitMQ event was published');
      }

      return {
        message: `Disruption handled for route ${route_id}`,
        affected: true,
        disrupted_line,
        user_id: route.user_id,
        action: 'Route unlocked, user notified via RabbitMQ and notification-service',
      };
    } catch (error) {
      console.error('handleDisruption error:', error?.response?.data ?? error);
      throw new InternalServerErrorException('Failed to handle disruption');
    }
  }
}