import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CompareFareDto } from './dto/compare-fare.dto';

// ── Service URLs (fall back to localhost defaults) ───────────────────────────
const ROUTE_CACHE_URL =
  process.env.ROUTE_CACHE_SERVICE_URL ?? 'http://localhost:3010';
const FARE_SERVICE_URL =
  process.env.FARE_SERVICE_URL ?? 'http://localhost:3004';
const RIDE_HAILING_AGGREGATOR_URL =
  process.env.RIDE_HAILING_AGGREGATOR_SERVICE_URL ?? 'http://localhost:3008';

// ── Segment mode → fare-service transportMode mapping ───────────────────────
const MODE_TO_TRANSPORT: Record<string, string | null> = {
  BUS: 'trunk_bus',
  MRT: 'mrt_lrt',
  LRT: 'mrt_lrt',
  WALK: null,       // walking has no fare
  TAXI: null,       // not PT — skip
  RIDE_HAIL: null,  // not PT — skip
};

@Injectable()
export class FareComparisonServiceService {
  private readonly logger = new Logger(FareComparisonServiceService.name);

  constructor(private readonly http: HttpService) {}

  // ── Main orchestration ────────────────────────────────────────────────────

  async compareFares(dto: CompareFareDto) {
    const { route_id, group_size, fare_category, sort_by } = dto;

    // 1. Fetch the locked route from route-cache-service
    const route = await this.fetchLockedRoute(route_id);

    // 2. Find the selected (locked) route option, or fall back to first PT option
    const selectedOption = this.resolveSelectedOption(route, route_id);

    // 3. Calculate total PT fare by summing segment fares
    const ptResult = await this.calculatePtFare(
      selectedOption,
      fare_category ?? 'adult_card',
    );

    // 4. Fetch ride-hailing quotes concurrently with PT calculation
    const rideResult = await this.fetchRideHailingQuotes(
      route.origin_label as string,
      route.destination_label as string,
      sort_by ?? 'price',
    );

    // 5. Calculate per-person ride-hailing cost for group travel
    const rideQuotesWithSplit = rideResult.quotes.map((q: any) => ({
      ...q,
      price_per_person:
        group_size > 1
          ? parseFloat((q.price / group_size).toFixed(2))
          : undefined,
    }));

    // 6. Build the comparison table
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
            ? `Cost split across ${group_size} people (ride cost ÷ ${group_size})`
            : undefined,
      },
      filters: {
        cheapest: this.findCheapest(ptResult.total_fare, rideQuotesWithSplit, group_size),
        fastest: this.findFastest(selectedOption.total_duration_mins, rideQuotesWithSplit),
      },
    };
  }

  // ── Step 1: Fetch route from route-cache-service ──────────────────────────

  private async fetchLockedRoute(route_id: number): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${ROUTE_CACHE_URL}/route-cache/by-route-id`, {
          params: { route_id },
        }),
      );
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        throw new NotFoundException(
          `Route ${route_id} not found in route-cache-service`,
        );
      }
      throw new InternalServerErrorException(
        `Could not reach route-cache-service: ${this.errorMsg(err)}`,
      );
    }
  }

  // ── Step 2: Resolve the option to price ──────────────────────────────────

  private resolveSelectedOption(route: any, route_id: number): any {
    const options: any[] = route.route_options ?? [];

    if (!options.length) {
      throw new BadRequestException(
        `Route ${route_id} has no route options stored`,
      );
    }

    // Prefer the user-selected option
    if (route.selected_option_id != null) {
      const selected = options.find(
        (o: any) => o.option_id === route.selected_option_id,
      );
      if (selected) return selected;
      this.logger.warn(
        `selected_option_id ${route.selected_option_id} not found in options — falling back to first PT option`,
      );
    }

    // Fall back to first PT option
    const ptOption = options.find((o: any) => o.is_public_transport);
    if (ptOption) return ptOption;

    // Last resort: first option regardless of type
    return options[0];
  }

  // ── Step 3: PT fare calculation ───────────────────────────────────────────

  private async calculatePtFare(
    option: any,
    fareCategory: string,
  ): Promise<{
    total_fare: number;
    breakdown: any[];
    segments_priced: number;
    segments_skipped: number;
  }> {
    const segments: any[] = option.segments ?? [];
    const breakdown: any[] = [];
    let totalFare = 0;
    let segmentsPriced = 0;
    let segmentsSkipped = 0;

    // Price each segment concurrently
    const results = await Promise.allSettled(
      segments.map(async (seg: any) => {
        const transportMode = MODE_TO_TRANSPORT[seg.mode as string];

        // Skip non-PT segments (walking, taxi, ride-hail)
        if (!transportMode) {
          return { seg, skipped: true, reason: `mode ${seg.mode} has no fare` };
        }

        try {
          const { data: fareRule } = await firstValueFrom(
            this.http.post(`${FARE_SERVICE_URL}/fare-service/calculate`, {
              transportMode,
              fareCategory,
              distanceKm: seg.distance_km,
            }),
          );

          return {
            seg,
            skipped: false,
            fare: parseFloat(fareRule.fareAmount),
            transportMode,
          };
        } catch (err: any) {
          this.logger.warn(
            `No fare rule for segment ${seg.segment_id} (${transportMode}, ${seg.distance_km}km): ${this.errorMsg(err)}`,
          );
          return { seg, skipped: true, reason: 'no fare rule found' };
        }
      }),
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        segmentsSkipped++;
        continue;
      }

      const val = result.value;
      if (val.skipped) {
        segmentsSkipped++;
        if (val.reason !== `mode ${val.seg.mode} has no fare`) {
          // Only include non-walk skips in breakdown for transparency
          breakdown.push({
            segment_id: val.seg.segment_id,
            mode: val.seg.mode,
            from_stop: val.seg.from_stop,
            to_stop: val.seg.to_stop,
            distance_km: val.seg.distance_km,
            fare: null,
            note: val.reason,
          });
        }
      } else {
        segmentsPriced++;
        totalFare += val.fare;
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
    }

    return {
      total_fare: parseFloat(totalFare.toFixed(2)),
      breakdown,
      segments_priced: segmentsPriced,
      segments_skipped: segmentsSkipped,
    };
  }

  // ── Step 4: Ride-hailing quotes ───────────────────────────────────────────

  private async fetchRideHailingQuotes(
    origin: string,
    destination: string,
    sortBy: 'price' | 'eta',
  ): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${RIDE_HAILING_AGGREGATOR_URL}/ridehail/quotes`,
          { origin, destination },
          { params: { sortBy } },
        ),
      );
      return data;
    } catch (err: any) {
      this.logger.warn(
        `ride-hailing-aggregator unavailable: ${this.errorMsg(err)} — returning empty quotes`,
      );
      // Return partial result rather than failing entire comparison
      return {
        metadata: null,
        quotes: [],
        provider_unavailable: true,
      };
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private findCheapest(
    ptFare: number,
    rideQuotes: any[],
    groupSize: number,
  ): { mode: string; provider: string; price: number } {
    const options: { mode: string; provider: string; price: number }[] = [
      { mode: 'public_transport', provider: 'PT', price: ptFare },
    ];

    for (const q of rideQuotes) {
      const effectivePrice = groupSize > 1 ? q.price_per_person : q.price;
      options.push({
        mode: 'ride_hailing',
        provider: q.provider,
        price: effectivePrice,
      });
    }

    return options.reduce((cheapest, curr) =>
      curr.price < cheapest.price ? curr : cheapest,
    );
  }

  private findFastest(
    ptDurationMins: number,
    rideQuotes: any[],
  ): { mode: string; provider: string; duration_mins: number } {
    const options: { mode: string; provider: string; duration_mins: number }[] =
      [{ mode: 'public_transport', provider: 'PT', duration_mins: ptDurationMins }];

    for (const q of rideQuotes) {
      options.push({
        mode: 'ride_hailing',
        provider: q.provider,
        duration_mins: q.eta,
      });
    }

    return options.reduce((fastest, curr) =>
      curr.duration_mins < fastest.duration_mins ? curr : fastest,
    );
  }

  private errorMsg(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
      const e = err as { response?: { data?: { message?: string } } };
      return e.response?.data?.message ?? 'unknown error';
    }
    return err instanceof Error ? err.message : 'unknown error';
  }
}
