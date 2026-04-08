import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, TravelMode } from '@googlemaps/google-maps-services-js';

type RouteStep = {
  travel_mode: string;
  duration: {
    value: number;
  };
  distance: {
    value: number;
  };
  transit_details?: {
    departure_stop?: {
      name?: string;
    };
    arrival_stop?: {
      name?: string;
    };
    line?: {
      short_name?: string;
      name?: string;
      vehicle?: {
        type?: string;
      };
    };
  };
};

type GoogleMapsErrorResponse = {
  response?: {
    data?: {
      status?: string;
      [key: string]: unknown;
    };
  };
};

@Injectable()
export class MapsWrapperService {
  private client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client({});
  }

  private normalizePlaceQuery(place: string) {
    const trimmedPlace = place.trim();

    if (!trimmedPlace) {
      return trimmedPlace;
    }

    if (/singapore/i.test(trimmedPlace)) {
      return trimmedPlace;
    }

    return `${trimmedPlace}, Singapore`;
  }

  private async getDirectionsWithFallback(
    apiKey: string,
    origin: string,
    destination: string,
    mode: TravelMode,
    alternatives: boolean,
  ) {
    try {
      return await this.client.directions({
        params: {
          origin,
          destination,
          mode,
          alternatives,
          key: apiKey,
        },
      });
    } catch (error: unknown) {
      const errorWithResponse = error as GoogleMapsErrorResponse;
      const googleStatus = errorWithResponse.response?.data?.status;

      if (googleStatus !== 'NOT_FOUND') {
        throw error;
      }

      return this.client.directions({
        params: {
          origin: this.normalizePlaceQuery(origin),
          destination: this.normalizePlaceQuery(destination),
          mode,
          alternatives,
          key: apiKey,
        },
      });
    }
  }

  async getRoutes(origin: string, destination: string) {
    if (!origin || !destination) {
      throw new BadRequestException('Both origin and destination are required');
    }

    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException('Missing GOOGLE_MAPS_API_KEY');
    }

    try {
      const response = await this.getDirectionsWithFallback(
        apiKey,
        origin,
        destination,
        TravelMode.transit,
        true,
      );

      const routes = response.data.routes;

      const transitOptions = routes.map((route, optionIndex) => {
        const leg = route.legs[0];
        const steps = (leg.steps ?? []) as RouteStep[];

        const transitSteps = steps.filter((s) => s.travel_mode === 'TRANSIT');
        const transferCount = Math.max(0, transitSteps.length - 1);

        const mainMode =
          transitSteps.length > 0
            ? (transitSteps[0].transit_details?.line?.vehicle?.type ??
              'TRANSIT')
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

      const drivingResponse = await this.getDirectionsWithFallback(
        apiKey,
        origin,
        destination,
        TravelMode.driving,
        false,
      );
      const drivingRoute = drivingResponse.data.routes[0];
      const drivingLeg = drivingRoute?.legs?.[0];

      const driving_option = drivingLeg
        ? {
            option_id: routes.length + 1,
            total_duration_mins: Math.round(drivingLeg.duration.value / 60),
            total_distance_km: parseFloat(
              (drivingLeg.distance.value / 1000).toFixed(2),
            ),
            summary: drivingRoute.summary || 'Driving',
            transfer_count: 0,
            main_mode: 'DRIVING',
            is_public_transport: false,
            segments: [
              {
                mode: 'DRIVING',
                from_stop: null,
                to_stop: null,
                duration_mins: Math.round(drivingLeg.duration.value / 60),
                distance_km: parseFloat(
                  (drivingLeg.distance.value / 1000).toFixed(2),
                ),
                line_or_service: null,
                segment_order: 1,
              },
            ],
          }
        : null;

      const options = driving_option
        ? [...transitOptions, driving_option]
        : transitOptions;

      return {
        origin_label: origin,
        destination_label: destination,
        options,
        driving_option,
      };
    } catch (error: unknown) {
      const errorWithResponse = error as GoogleMapsErrorResponse;

      console.error(
        'Google Maps API error:',
        JSON.stringify(errorWithResponse?.response?.data ?? error, null, 2),
      );

      throw new InternalServerErrorException(
        'Failed to fetch routes from Google Maps',
      );
    }
  }
}
