import { Injectable, NotFoundException } from '@nestjs/common';

interface TimingEntry {
  line: string;
  stop: string;
  predicted_arrival_mins: number;
}

const MOCK_TIMINGS: TimingEntry[] = [
  // EW Line
  { line: 'EW', stop: 'Tampines', predicted_arrival_mins: 3 },
  { line: 'EW', stop: 'Simei', predicted_arrival_mins: 4 },
  { line: 'EW', stop: 'Tanah Merah', predicted_arrival_mins: 2 },
  { line: 'EW', stop: 'Bedok', predicted_arrival_mins: 5 },
  { line: 'EW', stop: 'Kembangan', predicted_arrival_mins: 3 },
  { line: 'EW', stop: 'Eunos', predicted_arrival_mins: 4 },
  { line: 'EW', stop: 'Paya Lebar', predicted_arrival_mins: 2 },
  { line: 'EW', stop: 'Aljunied', predicted_arrival_mins: 3 },
  { line: 'EW', stop: 'Kallang', predicted_arrival_mins: 4 },
  { line: 'EW', stop: 'Lavender', predicted_arrival_mins: 3 },
  { line: 'EW', stop: 'Bugis', predicted_arrival_mins: 2 },
  { line: 'EW', stop: 'City Hall', predicted_arrival_mins: 4 },
  { line: 'EW', stop: 'Raffles Place', predicted_arrival_mins: 3 },
  { line: 'EW', stop: 'Tanjong Pagar', predicted_arrival_mins: 5 },
  { line: 'EW', stop: 'Outram Park', predicted_arrival_mins: 4 },

  // NS Line
  { line: 'NS', stop: 'City Hall', predicted_arrival_mins: 3 },
  { line: 'NS', stop: 'Raffles Place', predicted_arrival_mins: 2 },
  { line: 'NS', stop: 'Orchard', predicted_arrival_mins: 4 },
  { line: 'NS', stop: 'Somerset', predicted_arrival_mins: 3 },
  { line: 'NS', stop: 'Dhoby Ghaut', predicted_arrival_mins: 5 },
  { line: 'NS', stop: 'Braddell', predicted_arrival_mins: 4 },
  { line: 'NS', stop: 'Bishan', predicted_arrival_mins: 3 },

  // DT Line
  { line: 'DT', stop: 'Tampines', predicted_arrival_mins: 4 },
  { line: 'DT', stop: 'Tampines West', predicted_arrival_mins: 3 },
  { line: 'DT', stop: 'Bedok North', predicted_arrival_mins: 5 },
  { line: 'DT', stop: 'Bedok Reservoir', predicted_arrival_mins: 4 },
  { line: 'DT', stop: 'Kaki Bukit', predicted_arrival_mins: 3 },
  { line: 'DT', stop: 'Bencoolen', predicted_arrival_mins: 2 },
  { line: 'DT', stop: 'Jalan Besar', predicted_arrival_mins: 4 },
  { line: 'DT', stop: 'Fort Canning', predicted_arrival_mins: 3 },

  // TE Line
  { line: 'TE', stop: 'Outram Park', predicted_arrival_mins: 5 },
  { line: 'TE', stop: 'Orchard', predicted_arrival_mins: 3 },

  // Bus 65
  { line: '65', stop: 'Jln Besar Stn Exit A', predicted_arrival_mins: 7 },
  { line: '65', stop: 'Orchard Stn Exit 13', predicted_arrival_mins: 9 },

  // Bus 129
  { line: '129', stop: 'Opp Tampines Stn/Int', predicted_arrival_mins: 6 },
  { line: '129', stop: 'Braddell Stn/Blk 106', predicted_arrival_mins: 8 },

  // Bus 143
  { line: '143', stop: 'UE Sq', predicted_arrival_mins: 5 },
  { line: '143', stop: 'Opp Orchard Stn/ION', predicted_arrival_mins: 7 },
];

@Injectable()
export class ArrivalTimingServiceService {
  getArrivalTiming(line: string, stop: string) {
    if (!line || !stop) {
      return { error: 'line and stop query parameters are required' };
    }

    const match = MOCK_TIMINGS.find(
      (entry) =>
        entry.line.toLowerCase() === line.toLowerCase() &&
        entry.stop.toLowerCase() === stop.toLowerCase(),
    );

    if (!match) {
      // Return a random fallback between 3-10 mins instead of throwing error
      // so the service never fails even for unknown stops
      const fallback = Math.floor(Math.random() * 8) + 3;
      return {
        line,
        stop,
        predicted_arrival_mins: fallback,
        source: 'fallback',
      };
    }

    return {
      line: match.line,
      stop: match.stop,
      predicted_arrival_mins: match.predicted_arrival_mins,
      source: 'mock',
    };
  }
}