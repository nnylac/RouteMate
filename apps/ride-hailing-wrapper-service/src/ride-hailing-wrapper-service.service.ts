import { Injectable } from '@nestjs/common';

export interface RideQuote {
  provider: string;
  price: number;
  eta: number; // in minutes
  route: string;
  bookingLink: string;
}

@Injectable()
export class RideHailingWrapperServiceService {
  getGrabQuote(origin: string, destination: string): RideQuote {
    return {
      provider: 'Grab',
      price: 14.5,
      eta: 5,
      route: `${origin} → ${destination}`,
      bookingLink: 'grab://ride',
    };
  }

  getGojekQuote(origin: string, destination: string): RideQuote {
    return {
      provider: 'Gojek',
      price: 13.9,
      eta: 6,
      route: `${origin} → ${destination}`,
      bookingLink: 'gojek://ride',
    };
  }

  getTadaQuote(origin: string, destination: string): RideQuote {
    return {
      provider: 'TADA',
      price: 15.2,
      eta: 4,
      route: `${origin} → ${destination}`,
      bookingLink: 'tada://ride',
    };
  }
}
