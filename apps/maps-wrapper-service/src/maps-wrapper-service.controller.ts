import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MapsWrapperService } from './maps-wrapper-service.service';

@ApiTags('Maps Wrapper Service')
@Controller('maps')
export class MapsWrapperServiceController {
  constructor(private readonly mapsWrapperService: MapsWrapperService) {}

  @Get('routes')
  @ApiOperation({
    summary:
      'Get public transport routes between origin and destination via Google Maps',
  })
  @ApiQuery({ name: 'origin', example: 'SMU', description: 'Origin location' })
  @ApiQuery({
    name: 'destination',
    example: 'Changi Airport',
    description: 'Destination location',
  })
  @ApiResponse({
    status: 200,
    description:
      'Routes retrieved successfully from Google Maps Directions API',
    schema: {
      example: [
        {
          option_id: 1,
          summary: 'MRT via EW Line',
          total_duration_mins: 45,
          total_distance_km: 18.2,
          transfer_count: 1,
          main_mode: 'MRT',
          is_public_transport: true,
          segments: [
            {
              segment_id: 1,
              mode: 'WALK',
              from_stop: null,
              to_stop: 'City Hall MRT',
              duration_mins: 5,
              distance_km: 0.3,
              segment_order: 1,
            },
            {
              segment_id: 2,
              mode: 'MRT',
              from_stop: 'City Hall MRT',
              to_stop: 'Changi Airport MRT',
              duration_mins: 35,
              distance_km: 17.5,
              line_or_service: 'EW',
              segment_order: 2,
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Missing origin or destination',
    schema: {
      example: {
        message: 'origin and destination are required',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Google Maps API error or API key missing',
    schema: {
      example: {
        message: 'Failed to fetch routes from Google Maps',
        error: 'Internal Server Error',
        statusCode: 500,
      },
    },
  })
  async getRoutes(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return this.mapsWrapperService.getRoutes(origin, destination);
  }
}
