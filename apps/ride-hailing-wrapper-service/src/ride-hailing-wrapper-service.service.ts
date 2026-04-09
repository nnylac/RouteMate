import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface RideQuote {
  provider: string;
  price: number;
  eta: number;
  route: string;
  bookingLink: string;
}

@Injectable()
export class RideHailingWrapperServiceService {
  constructor(private readonly httpService: HttpService) {}

  private readonly MOCK_API_URL = 'http://localhost:4000/quotes';

  private normalizeLocation(value: string) {
    return value.trim().toLowerCase();
  }

  private isLocationMatch(input: string, candidate: string) {
    const normalizedInput = this.normalizeLocation(input);
    const normalizedCandidate = this.normalizeLocation(candidate);

    return (
      normalizedInput === normalizedCandidate ||
      normalizedCandidate.includes(normalizedInput) ||
      normalizedInput.includes(normalizedCandidate)
    );
  }

  async getQuoteFromMock(
    provider: string,
    origin: string,
    destination: string,
  ): Promise<RideQuote> {
    // 1. Fetch all quote entries from the mock server
    const { data } = await firstValueFrom(
      this.httpService.get<any[]>(this.MOCK_API_URL),
    );

    // 2. Try exact-ish / partial matching on origin and destination
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const routeData = data.find(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (route: any) =>
        this.isLocationMatch(origin, route.origin) &&
        this.isLocationMatch(destination, route.destination),
    );

    if (!routeData) {
      throw new Error(
        `Route from ${origin} to ${destination} not found in mock data`,
      );
    }

    // 3. Find the specific provider within that route
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const quote = routeData.results.find(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (r: any) => r.provider.toLowerCase() === provider.toLowerCase(),
    ); // <--- Added the missing ');' here

    if (!quote) {
      throw new Error(`Provider ${provider} not found for this route`);
    }

    // 4. Return the formatted result
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      provider: quote.provider,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      price: quote.price,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      eta: quote.eta,
      route: `${origin} → ${destination}`,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      bookingLink: quote.link,
    };
  }

  async getGrabQuote(origin: string, destination: string) {
    return this.getQuoteFromMock('Grab', origin, destination);
  }

  async getGojekQuote(origin: string, destination: string) {
    return this.getQuoteFromMock('Gojek', origin, destination);
  }

  async getTadaQuote(origin: string, destination: string) {
    return this.getQuoteFromMock('Tada', origin, destination);
  }
}
