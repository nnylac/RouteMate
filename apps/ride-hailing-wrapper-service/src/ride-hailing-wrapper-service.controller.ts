import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RideHailingWrapperServiceService } from './ride-hailing-wrapper-service.service';

@ApiTags('Ride-Hailing Wrapper')
@Controller()
export class RideHailingWrapperServiceController {
  constructor(private readonly service: RideHailingWrapperServiceService) {}

  @Get('grab/quotes')
  @ApiOperation({ summary: 'Get Grab quote for a route' })
  @ApiQuery({ name: 'origin', example: 'SMU', description: 'Origin location' })
  @ApiQuery({
    name: 'destination',
    example: 'Changi Airport',
    description: 'Destination location',
  })
  @ApiResponse({
    status: 200,
    description: 'Grab quote retrieved successfully',
    schema: {
      example: {
        provider: 'Grab',
        price: 28.5,
        eta: 12,
        route: 'SMU → Changi Airport',
        bookingLink: 'https://grab.fake/ride1',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Route not found or provider unavailable',
    schema: {
      example: {
        message: 'Route from SMU to Changi Airport not found in mock data',
      },
    },
  })
  async getGrab(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return await this.service.getGrabQuote(origin, destination);
  }

  @Get('gojek/quotes')
  @ApiOperation({ summary: 'Get Gojek quote for a route' })
  @ApiQuery({ name: 'origin', example: 'SMU', description: 'Origin location' })
  @ApiQuery({
    name: 'destination',
    example: 'Changi Airport',
    description: 'Destination location',
  })
  @ApiResponse({
    status: 200,
    description: 'Gojek quote retrieved successfully',
    schema: {
      example: {
        provider: 'Gojek',
        price: 26.0,
        eta: 15,
        route: 'SMU → Changi Airport',
        bookingLink: 'https://gojek.fake/ride2',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Route not found or provider unavailable',
    schema: {
      example: {
        message: 'Route from SMU to Changi Airport not found in mock data',
      },
    },
  })
  async getGojek(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return await this.service.getGojekQuote(origin, destination);
  }

  @Get('tada/quotes')
  @ApiOperation({ summary: 'Get Tada quote for a route' })
  @ApiQuery({ name: 'origin', example: 'SMU', description: 'Origin location' })
  @ApiQuery({
    name: 'destination',
    example: 'Changi Airport',
    description: 'Destination location',
  })
  @ApiResponse({
    status: 200,
    description: 'Tada quote retrieved successfully',
    schema: {
      example: {
        provider: 'Tada',
        price: 24.5,
        eta: 18,
        route: 'SMU → Changi Airport',
        bookingLink: 'https://tada.fake/ride3',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Route not found or provider unavailable',
    schema: {
      example: {
        message: 'Route from SMU to Changi Airport not found in mock data',
      },
    },
  })
  async getTada(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return await this.service.getTadaQuote(origin, destination);
  }
}
