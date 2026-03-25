import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const MAPS_WRAPPER_URL = 'http://localhost:3005';
const ARRIVAL_TIMING_URL = 'http://localhost:3013';
const ROUTE_CACHE_URL = 'http://localhost:3010';

@Injectable()
export class RoutePlannerOrchestratorServiceService {
  constructor(private readonly httpService: HttpService) {}

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
              const segmentWithId = {
                ...segment,
                segment_id: segIndex + 1,
              };

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
                  return {
                    ...segmentWithId,
                    arrival_timing: timingResponse.data,
                  };
                } catch {
                  return { ...segmentWithId, arrival_timing: null };
                }
              }
              return segmentWithId;
            }),
          );
          return { ...option, segments: enrichedSegments };
        }),
      );

      const route_id = Date.now();

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
          route_options: enrichedOptions,
        }),
      );

      return {
        route_id,
        user_id,
        origin_label: origin,
        destination_label: destination,
        options: enrichedOptions,
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
}