import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CompareFareDto } from './dto/compare-fare.dto';

const ROUTE_CACHE_URL =
  process.env.ROUTE_CACHE_SERVICE_URL ?? 'http://localhost:3010';
const FARE_SERVICE_URL =
  process.env.FARE_SERVICE_URL ?? 'http://localhost:3004';
const RIDE_HAILING_AGGREGATOR_URL =
  process.env.RIDE_HAILING_AGGREGATOR_SERVICE_URL ?? 'http://localhost:3008';

const MODE_TO_TRANSPORT: Record<string, string | null> = {
  BUS: 'trunk_bus',
  MRT: 'mrt_lrt',
  LRT: 'mrt_lrt',
  WALK: null,
  TAXI: null,
  RIDE_HAIL: null,
};

interface CachedRouteSegment {
  segment_id: number;
  mode: string;
  from_stop: string | null;
  to_stop: string | null;
  duration_mins: number;
  distance_km: number;
  line_or_service?: string | null;
}

interface CachedRouteOption {
  option_id: number;
  main_mode?: string;
  total_duration_mins: number;
  total_distance_km: number;
  transfer_count: number;
  is_public_transport?: boolean;
  segments?: CachedRouteSegment[];
}

interface CachedRoute {
  route_id: number;
  origin_label: string;
  destination_label: string;
  selected_option_id?: number | null;
  route_options?: CachedRouteOption[];
}

interface FareServiceRule {
  fareAmount: string | number;
}

interface FareBreakdownItem {
  segment_id: number;
  mode: string;
  transport_mode?: string;
  from_stop: string | null;
  to_stop: string | null;
  distance_km: number;
  fare: number | null;
  note?: string;
}

interface PtFareResult {
  total_fare: number;
  breakdown: FareBreakdownItem[];
  segments_priced: number;
  segments_skipped: number;
}

interface RideQuote {
  provider: string;
  price: number;
  eta: number;
  price_per_person?: number;
}

interface RideHailingResult {
  metadata: {
    totalOptions: number;
    cheapestProvider: string;
    fastestProvider: string;
  } | null;
  quotes: RideQuote[];
  provider_unavailable?: boolean;
}

@Injectable()
export class FareComparisonServiceService {
  private readonly logger = new Logger(FareComparisonServiceService.name);

  constructor(private readonly http: HttpService) {}

  async compareFares(dto: CompareFareDto) {
    const { route_id, group_size, fare_category, sort_by } = dto;
    const route = await this.fetchLockedRoute(route_id);
    const selectedOption = this.resolveSelectedOption(route, route_id);
    const ptResult = await this.calculatePtFare(
      selectedOption,
      fare_category ?? 'adult_card',
    );
    const rideResult = await this.fetchRideHailingQuotes(
      route.origin_label,
      route.destination_label,
      sort_by ?? 'price',
    );

    const rideQuotesWithSplit = rideResult.quotes.map((quote) => ({
      ...quote,
      price_per_person:
        group_size > 1
          ? parseFloat((quote.price / group_size).toFixed(2))
          : undefined,
    }));

    return {
      route_id,
      origin: route.origin_label,
      destination: route.destination_label,
      group_size,
      fare_category: fare_category ?? 'adult_card',
      public_transport: {
        mode: selectedOption.main_mode ?? 'PUBLIC_TRANSPORT',
        total_duration_mins: selectedOption.total_duration_mins,
        total_distance_km: selectedOption.total_distance_km,
        transfer_count: selectedOption.transfer_count,
        fare_per_person: ptResult.total_fare,
        fare_breakdown: ptResult.breakdown,
        segments_priced: ptResult.segments_priced,
        segments_skipped: ptResult.segments_skipped,
      },
      ride_hailing: {
        metadata: rideResult.metadata,
        quotes: rideQuotesWithSplit,
        group_size_note:
          group_size > 1
            ? `Cost split across ${group_size} people (ride cost / ${group_size})`
            : undefined,
      },
      filters: {
        cheapest: this.findCheapest(
          ptResult.total_fare,
          rideQuotesWithSplit,
          group_size,
        ),
        fastest: this.findFastest(
          selectedOption.total_duration_mins,
          rideQuotesWithSplit,
        ),
      },
    };
  }

  private async fetchLockedRoute(routeId: number): Promise<CachedRoute> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<CachedRoute>(
          `${ROUTE_CACHE_URL}/route-cache/by-route-id`,
          {
            params: { route_id: routeId },
          },
        ),
      );
      return data;
    } catch (err: unknown) {
      const responseStatus =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { status?: number } }).response?.status ===
          'number'
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;

      if (responseStatus === 404) {
        throw new NotFoundException(
          `Route ${routeId} not found in route-cache-service`,
        );
      }

      throw new InternalServerErrorException(
        `Could not reach route-cache-service: ${this.errorMsg(err)}`,
      );
    }
  }

  private resolveSelectedOption(
    route: CachedRoute,
    routeId: number,
  ): CachedRouteOption {
    const options = route.route_options ?? [];

    if (!options.length) {
      throw new BadRequestException(
        `Route ${routeId} has no route options stored`,
      );
    }

    if (route.selected_option_id != null) {
      const selected = options.find(
        (option) => option.option_id === route.selected_option_id,
      );
      if (selected) {
        return selected;
      }

      this.logger.warn(
        `selected_option_id ${route.selected_option_id} not found in options - falling back to first PT option`,
      );
    }

    const ptOption = options.find((option) => option.is_public_transport);
    return ptOption ?? options[0];
  }

  private async calculatePtFare(
    option: CachedRouteOption,
    fareCategory: string,
  ): Promise<PtFareResult> {
    const segments = option.segments ?? [];
    const breakdown: FareBreakdownItem[] = [];
    let totalFare = 0;
    let segmentsPriced = 0;
    let segmentsSkipped = 0;

    const results = await Promise.allSettled(
      segments.map(async (segment) => {
        const transportMode = MODE_TO_TRANSPORT[segment.mode];

        if (!transportMode) {
          return {
            segment,
            skipped: true as const,
            reason: `mode ${segment.mode} has no fare`,
          };
        }

        try {
          const { data: fareRule } = await firstValueFrom(
            this.http.post<FareServiceRule>(
              `${FARE_SERVICE_URL}/fare-service/calculate`,
              {
                transportMode,
                fareCategory,
                distanceKm: segment.distance_km,
              },
            ),
          );

          return {
            segment,
            skipped: false as const,
            fare: parseFloat(String(fareRule.fareAmount)),
            transportMode,
          };
        } catch (err: unknown) {
          this.logger.warn(
            `No fare rule for segment ${segment.segment_id} (${transportMode}, ${segment.distance_km}km): ${this.errorMsg(err)}`,
          );
          return {
            segment,
            skipped: true as const,
            reason: 'no fare rule found',
          };
        }
      }),
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        segmentsSkipped++;
        continue;
      }

      const value = result.value;
      if (value.skipped) {
        segmentsSkipped++;
        if (value.reason !== `mode ${value.segment.mode} has no fare`) {
          breakdown.push({
            segment_id: value.segment.segment_id,
            mode: value.segment.mode,
            from_stop: value.segment.from_stop,
            to_stop: value.segment.to_stop,
            distance_km: value.segment.distance_km,
            fare: null,
            note: value.reason,
          });
        }
      } else {
        segmentsPriced++;
        totalFare += val.fare ?? 0;
        breakdown.push({
          segment_id: val.seg.segment_id,
          mode: val.seg.mode,
          transport_mode: val.transportMode,
          from_stop: val.seg.from_stop,
          to_stop: val.seg.to_stop,
          distance_km: val.seg.distance_km,
          fare: val.fare,
        });
      }

      segmentsPriced++;
      totalFare += value.fare;
      breakdown.push({
        segment_id: value.segment.segment_id,
        mode: value.segment.mode,
        transport_mode: value.transportMode,
        from_stop: value.segment.from_stop,
        to_stop: value.segment.to_stop,
        distance_km: value.segment.distance_km,
        fare: value.fare,
      });
    }

    return {
      total_fare: parseFloat(totalFare.toFixed(2)),
      breakdown,
      segments_priced: segmentsPriced,
      segments_skipped: segmentsSkipped,
    };
  }

  private async fetchRideHailingQuotes(
    origin: string,
    destination: string,
    sortBy: 'price' | 'eta',
  ): Promise<RideHailingResult> {
    try {
      const { data } = await firstValueFrom(
        this.http.post<RideHailingResult>(
          `${RIDE_HAILING_AGGREGATOR_URL}/ridehail/quotes`,
          { origin, destination },
          { params: { sortBy } },
        ),
      );
      return data;
    } catch (err: unknown) {
      this.logger.warn(
        `ride-hailing-aggregator unavailable: ${this.errorMsg(err)} - returning empty quotes`,
      );
      return {
        metadata: null,
        quotes: [],
        provider_unavailable: true,
      };
    }
  }

  private findCheapest(
    ptFare: number,
    rideQuotes: RideQuote[],
    groupSize: number,
  ): { mode: string; provider: string; price: number } {
    const options: Array<{ mode: string; provider: string; price: number }> = [
      { mode: 'public_transport', provider: 'PT', price: ptFare },
    ];

    for (const quote of rideQuotes) {
      const effectivePrice =
        groupSize > 1 && typeof quote.price_per_person === 'number'
          ? quote.price_per_person
          : quote.price;
      options.push({
        mode: 'ride_hailing',
        provider: quote.provider,
        price: effectivePrice,
      });
    }

    return options.reduce((cheapest, current) =>
      current.price < cheapest.price ? current : cheapest,
    );
  }

  private findFastest(
    ptDurationMins: number,
    rideQuotes: RideQuote[],
  ): { mode: string; provider: string; duration_mins: number } {
    const options: Array<{
      mode: string;
      provider: string;
      duration_mins: number;
    }> = [
      {
        mode: 'public_transport',
        provider: 'PT',
        duration_mins: ptDurationMins,
      },
    ];

    for (const quote of rideQuotes) {
      options.push({
        mode: 'ride_hailing',
        provider: quote.provider,
        duration_mins: quote.eta,
      });
    }

    return options.reduce((fastest, current) =>
      current.duration_mins < fastest.duration_mins ? current : fastest,
    );
  }

  private errorMsg(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
      const error = err as { response?: { data?: { message?: string } } };
      return error.response?.data?.message ?? 'unknown error';
    }

    return err instanceof Error ? err.message : 'unknown error';
  }
}
