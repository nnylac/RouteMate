import { Injectable } from '@nestjs/common';

@Injectable()
export class ArrivalTimingServiceService {
  getArrivalTiming(line: string, stop: string) {
    if (!line || !stop) {
      return { error: 'line and stop query parameters are required' };
    }

    // Generate random arrival time between 2-12 minutes
    const predicted_arrival_mins = Math.floor(Math.random() * 11) + 2;

    return {
      line,
      stop,
      predicted_arrival_mins,
      source: 'mock',
    };
  }
}