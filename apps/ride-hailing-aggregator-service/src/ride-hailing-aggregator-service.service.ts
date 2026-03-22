import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Define the shape of the data we expect from the Wrapper
export interface RideQuote {
  provider: string;
  price: number;
  eta: number;
  route?: string;
  bookingLink?: string;
}

@Injectable()
export class RideHailingAggregatorServiceService {
  constructor(private readonly http: HttpService) {}

  async getQuotes(
    origin: string,
    destination: string,
    sortBy: 'price' | 'eta' = 'price',
  ) {
    const baseUrl = process.env.WRAPPER_BASE_URL || 'http://localhost:3009';
    const responses = await Promise.allSettled([
      firstValueFrom(
        this.http.get<RideQuote>(`${baseUrl}/grab/quotes`, {
          params: { origin, destination },
        }),
      ),
      firstValueFrom(
        this.http.get<RideQuote>(`${baseUrl}/gojek/quotes`, {
          params: { origin, destination },
        }),
      ),
      firstValueFrom(
        this.http.get<RideQuote>(`${baseUrl}/tada/quotes`, {
          params: { origin, destination },
        }),
      ),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const quotes: RideQuote[] = responses
      .filter(
        (res): res is PromiseFulfilledResult<{ data: RideQuote }> =>
          res.status === 'fulfilled',
      )
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .map((res) => res.value.data);

    // 3. If no quotes were found, return empty early
    if (quotes.length === 0) {
      return { metadata: null, quotes: [] };
    }

    const sortedQuotes = [...quotes].sort((a, b) => {
      if (sortBy === 'eta') {
        return a.eta - b.eta;
      }
      // Default to price
      return a.price - b.price;
    });

    return {
      metadata: {
        totalOptions: sortedQuotes.length,
        cheapestProvider: quotes.reduce((prev, curr) =>
          prev.price < curr.price ? prev : curr,
        ).provider,
        fastestProvider: quotes.reduce((prev, curr) =>
          prev.eta < curr.eta ? prev : curr,
        ).provider,
      },
      quotes: sortedQuotes,
    };
  }
}
