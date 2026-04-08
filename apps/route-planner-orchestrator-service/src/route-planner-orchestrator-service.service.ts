import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

const MAPS_WRAPPER_URL = 'http://localhost:3005';
const ARRIVAL_TIMING_URL = 'http://localhost:3013';
const ROUTE_CACHE_URL = 'http://localhost:3010';
const NOTIFICATION_URL = 'http://localhost:3006';
const FARE_SERVICE_URL = 'http://localhost:3004';

type SupportedFareCategory = 'adult_card' | 'student_card' | 'senior_card';

type EnrichedSegment = {
  segment_id: number;
  mode: string;
  from_stop: string | null;
  to_stop: string | null;
  duration_mins: number;
  distance_km: number;
  line_or_service: string | null;
  segment_order: number;
  arrival_timing: unknown;
};

type SegmentFareBreakdown = {
  segment_id: number;
  segment_order: number;
  mode: 'BUS' | 'MRT';
  line_or_service: string | null;
  distance_km: number;
  cumulative_distance_km: number;
  fare_basis_mode: 'trunk_bus' | 'mrt_lrt';
  fares: Record<
    SupportedFareCategory,
    {
      incremental: number;
      cumulative: number;
    }
  >;
};

type OptionFareBreakdown = {
  fare_basis_mode: 'trunk_bus' | 'mrt_lrt' | null;
  totals: Record<SupportedFareCategory, number>;
  segments: SegmentFareBreakdown[];
};

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

  private readonly supportedFareCategories: SupportedFareCategory[] = [
    'adult_card',
    'student_card',
    'senior_card',
  ];

  private getFareTransportMode(
    segmentMode: string,
  ): 'trunk_bus' | 'mrt_lrt' | null {
    if (segmentMode === 'BUS') {
      return 'trunk_bus';
    }

    if (segmentMode === 'MRT') {
      return 'mrt_lrt';
    }

    return null;
  }

  private async lookupFareAmount(
    transportMode: 'trunk_bus' | 'mrt_lrt',
    fareCategory: SupportedFareCategory,
    distanceKm: number,
  ): Promise<number> {
    const payload: Record<string, string | number> = {
      transportMode,
      fareCategory,
      distanceKm: Number(distanceKm.toFixed(2)),
    };

    if (transportMode === 'mrt_lrt') {
      payload.applicableTime = 'All other timings';
    }

    const response = await firstValueFrom(
      this.httpService.post(`${FARE_SERVICE_URL}/fare-service/calculate`, payload),
    );

    return Number(response.data?.fareAmount ?? 0);
  }

  private async calculatePublicTransportFares(
    segments: EnrichedSegment[],
  ): Promise<OptionFareBreakdown> {
    const payableSegments = segments.filter(
      (segment) => segment.mode === 'BUS' || segment.mode === 'MRT',
    );

    if (payableSegments.length === 0) {
      return {
        fare_basis_mode: null,
        totals: {
          adult_card: 0,
          student_card: 0,
          senior_card: 0,
        },
        segments: [],
      };
    }

    const fareBasisMode = this.getFareTransportMode(payableSegments[0].mode);

    if (!fareBasisMode) {
      return {
        fare_basis_mode: null,
        totals: {
          adult_card: 0,
          student_card: 0,
          senior_card: 0,
        },
        segments: [],
      };
    }

    let cumulativeDistanceKm = 0;
    const runningTotals: Record<SupportedFareCategory, number> = {
      adult_card: 0,
      student_card: 0,
      senior_card: 0,
    };
    const fareSegments: SegmentFareBreakdown[] = [];

    for (const segment of payableSegments) {
      cumulativeDistanceKm += Number(segment.distance_km ?? 0);

      const faresByCategory = await Promise.all(
        this.supportedFareCategories.map(async (fareCategory) => {
          const cumulativeFare = await this.lookupFareAmount(
            fareBasisMode,
            fareCategory,
            cumulativeDistanceKm,
          );

          const previousTotal = runningTotals[fareCategory];
          const incrementalFare = Number(
            Math.max(cumulativeFare - previousTotal, 0).toFixed(2),
          );

          runningTotals[fareCategory] = Number(cumulativeFare.toFixed(2));

          return [
            fareCategory,
            {
              incremental: incrementalFare,
              cumulative: runningTotals[fareCategory],
            },
          ] as const;
        }),
      );

      fareSegments.push({
        segment_id: segment.segment_id,
        segment_order: segment.segment_order,
        mode: segment.mode as 'BUS' | 'MRT',
        line_or_service: segment.line_or_service,
        distance_km: segment.distance_km,
        cumulative_distance_km: Number(cumulativeDistanceKm.toFixed(2)),
        fare_basis_mode: fareBasisMode,
        fares: Object.fromEntries(faresByCategory) as SegmentFareBreakdown['fares'],
      });
    }

    return {
      fare_basis_mode: fareBasisMode,
      totals: {
        adult_card: runningTotals.adult_card,
        student_card: runningTotals.student_card,
        senior_card: runningTotals.senior_card,
      },
      segments: fareSegments,
    };
  }

  async searchRoutes(user_id: number, origin: string, destination: string) {
    try {
      const mapsResponse = await firstValueFrom(
        this.httpService.get(`${MAPS_WRAPPER_URL}/maps/routes`, {
          params: { origin, destination },
        }),
      );
      const { options: rawOptions, driving_option } = mapsResponse.data;
      const options = rawOptions.filter(
        (option: any) => option.main_mode !== 'DRIVING',
      );

      const enrichedOptions = await Promise.all(
        options.map(async (option: any) => {
          const enrichedSegments = await Promise.all(
            option.segments.map(async (segment: any, segIndex: number) => {
              const mappedMode = this.mapMode(
                segment.mode,
                segment.line_or_service,
              );

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

          const fareBreakdown = option.is_public_transport
            ? await this.calculatePublicTransportFares(enrichedSegments)
            : {
                fare_basis_mode: null,
                totals: {
                  adult_card: 0,
                  student_card: 0,
                  senior_card: 0,
                },
                segments: [],
              };

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
            fare: fareBreakdown.totals.adult_card,
            fares: fareBreakdown,
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
        driving_option,
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
