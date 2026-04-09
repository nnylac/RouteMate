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
const RIDE_HAILING_AGGREGATOR_URL =
  process.env.RIDE_HAILING_AGGREGATOR_SERVICE_URL ?? 'http://localhost:3008';

type FareCategoryKey = 'adult_card' | 'student_card' | 'senior_card';

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
  fare?: number | null;
  summary?: string;
  is_public_transport?: boolean;
  segments?: CachedRouteSegment[];
  fares?: {
    fare_basis_mode?: string | null;
    totals: Record<FareCategoryKey, number>;
    segments: Array<{
      segment_id: number;
      segment_order: number;
      mode: 'BUS' | 'MRT';
      line_or_service?: string | null;
      distance_km: number;
      cumulative_distance_km: number;
      fare_basis_mode?: string | null;
      fares: Record<
        FareCategoryKey,
        {
          incremental: number;
          cumulative: number;
        }
      >;
    }>;
  } | null;
}

interface CachedRoute {
  route_id: number;
  origin_label: string;
  destination_label: string;
  selected_option_id?: number | null;
  route_options?: CachedRouteOption[];
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
      (fare_category ?? 'adult_card') as FareCategoryKey,
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
        selected_option: selectedOption,
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
    fareCategory: FareCategoryKey,
  ): Promise<PtFareResult> {
    const segments = option.segments ?? [];
    const breakdown: FareBreakdownItem[] = [];
    const payableSegments = segments.filter(
      (segment) =>
        segment.mode === 'BUS' ||
        segment.mode === 'MRT' ||
        segment.mode === 'LRT',
    );

    if (option.fares?.segments?.length) {
      for (const fareSegment of option.fares.segments) {
        const routeSegment = segments.find(
          (segment) => segment.segment_id === fareSegment.segment_id,
        );

        breakdown.push({
          segment_id: fareSegment.segment_id,
          mode: fareSegment.mode,
          transport_mode: fareSegment.fare_basis_mode ?? undefined,
          from_stop: routeSegment?.from_stop ?? null,
          to_stop: routeSegment?.to_stop ?? null,
          distance_km: fareSegment.distance_km,
          fare: Number(fareSegment.fares[fareCategory]?.incremental ?? 0),
        });
      }

      return {
        total_fare: parseFloat(
          String(option.fares.totals?.[fareCategory] ?? option.fare ?? 0),
        ),
        breakdown,
        segments_priced: breakdown.length,
        segments_skipped: Math.max(
          0,
          payableSegments.length - breakdown.length,
        ),
      };
    }

    return {
      total_fare: parseFloat(String(option.fare ?? 0)),
      breakdown,
      segments_priced: 0,
      segments_skipped: payableSegments.length,
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
