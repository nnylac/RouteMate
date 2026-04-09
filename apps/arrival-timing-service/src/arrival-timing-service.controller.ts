import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ArrivalTimingServiceService } from './arrival-timing-service.service';

@ApiTags('Arrival Timing Service')
@Controller('arrival-timing')
export class ArrivalTimingServiceController {
  constructor(
    private readonly arrivalTimingServiceService: ArrivalTimingServiceService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Arrival timing service is running',
    schema: { example: 'arrival timing service is running' },
  })
  @Get('health')
  getHello(): string {
    return 'arrival timing service is running';
  }

  @Get('timing')
  @ApiOperation({ summary: 'Get arrival timing for a bus/MRT line and stop' })
  @ApiQuery({
    name: 'line',
    example: 'EW',
    description: 'MRT line or bus service number',
  })
  @ApiQuery({
    name: 'stop',
    example: 'Raffles Place',
    description: 'Station or bus stop name',
  })
  @ApiResponse({
    status: 200,
    description: 'Arrival timing retrieved successfully',
    schema: {
      example: {
        line: 'EW',
        stop: 'Raffles Place',
        nextArrivalMins: 3,
        subsequentArrivalMins: 8,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Missing line or stop parameter',
    schema: {
      example: {
        message: 'line and stop are required',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  getArrivalTiming(@Query('line') line: string, @Query('stop') stop: string) {
    return this.arrivalTimingServiceService.getArrivalTiming(line, stop);
  }
}
