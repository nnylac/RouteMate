import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  TravelMode,
} from '@googlemaps/google-maps-services-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

@Injectable()
export class MapsWrapperServiceService {
  private client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client({});
  }

  async getRoutes(origin: string, destination: string) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY!;

    try {
      const response = await this.client.directions({
        params: {
          origin,
          destination,
          mode: TravelMode.transit,
          alternatives: true,
          key: apiKey,
        },
      });

      const routes = response.data.routes;

      const options = routes.map((route, optionIndex) => {
        const leg = route.legs[0];
        const steps = leg.steps as any[];

        const transitSteps = steps.filter(
          (s) => s.travel_mode === 'TRANSIT',
        );
        const transferCount = Math.max(0, transitSteps.length - 1);

        const mainMode =
          transitSteps.length > 0
            ? (transitSteps[0].transit_details?.line?.vehicle?.type ?? 'TRANSIT')
            : 'WALKING';

        const isPublicTransport = transitSteps.length > 0;

        const segments = steps.map((step, segIndex) => {
          const isTransit = step.travel_mode === 'TRANSIT';
          return {
            mode: step.travel_mode,
            from_stop: isTransit
              ? (step.transit_details?.departure_stop?.name ?? null)
              : null,
            to_stop: isTransit
              ? (step.transit_details?.arrival_stop?.name ?? null)
              : null,
            duration_mins: Math.round(step.duration.value / 60),
            distance_km: parseFloat((step.distance.value / 1000).toFixed(2)),
            line_or_service: isTransit
              ? (step.transit_details?.line?.short_name ??
                 step.transit_details?.line?.name ??
                 null)
              : null,
            segment_order: segIndex + 1,
          };
        });

        return {
          option_id: optionIndex + 1,
          summary: route.summary || `Option ${optionIndex + 1}`,
          total_duration_mins: Math.round(leg.duration.value / 60),
          total_distance_km: parseFloat((leg.distance.value / 1000).toFixed(2)),
          transfer_count: transferCount,
          main_mode: mainMode,
          is_public_transport: isPublicTransport,
          segments,
        };
      });

      return {
        origin_label: origin,
        destination_label: destination,
        options,
      };
    } catch (error) {
      console.error('Google Maps API error:', JSON.stringify(error?.response?.data ?? error, null, 2));
      throw new InternalServerErrorException('Failed to fetch routes from Google Maps');
    }
  }
}