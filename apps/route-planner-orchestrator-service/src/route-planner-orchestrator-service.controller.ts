import { Controller, Get, Post, Patch, Query, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RoutePlannerOrchestratorServiceService } from './route-planner-orchestrator-service.service';

@ApiTags('Route Planner Orchestrator')
@Controller('route-planner')
export class RoutePlannerOrchestratorServiceController {
  constructor(
    private readonly routePlannerOrchestratorServiceService: RoutePlannerOrchestratorServiceService,
  ) {}

  @Post('search')
  @ApiOperation({ summary: 'Search for routes between origin and destination' })
  @ApiBody({
    schema: {
      example: { user_id: 1, origin: 'SMU', destination: 'Changi Airport' },
      properties: {
        user_id: { type: 'number', example: 1 },
        origin: { type: 'string', example: 'SMU' },
        destination: { type: 'string', example: 'Changi Airport' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Routes found and cached successfully',
    schema: {
      example: {
        route_id: 1,
        user_id: 1,
        origin_label: 'SMU',
        destination_label: 'Changi Airport',
        search_status: 'GENERATED',
        is_locked: false,
        route_options: [
          {
            option_id: 1,
            summary: 'MRT via EW Line',
            total_duration_mins: 45,
            total_distance_km: 18.2,
            transfer_count: 1,
            main_mode: 'MRT',
            is_public_transport: true,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description:
      'Failed to search routes — Google Maps API error or downstream service unavailable',
    schema: {
      example: {
        message: 'Failed to search routes',
        error: 'Internal Server Error',
        statusCode: 500,
      },
    },
  })
  async searchRoutes(
    @Body('user_id') user_id: number,
    @Body('origin') origin: string,
    @Body('destination') destination: string,
  ) {
    return this.routePlannerOrchestratorServiceService.searchRoutes(user_id, origin, destination);
  }

  @Patch('select')
  @ApiOperation({
    summary: 'Select a route option — locks the route for fare comparison',
  })
  @ApiBody({
    schema: {
      example: { route_id: 1, option_id: 2 },
      properties: {
        route_id: { type: 'number', example: 1 },
        option_id: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Route option selected and locked',
    schema: {
      example: {
        route_id: 1,
        selected_option_id: 2,
        is_locked: true,
        search_status: 'SELECTED',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
    schema: {
      example: {
        message: 'Route not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async selectRoute(
    @Body('route_id') route_id: number,
    @Body('option_id') option_id: number,
  ) {
    return this.routePlannerOrchestratorServiceService.selectRoute(
      route_id,
      option_id,
    );
  }

  @Get('routes')
  @ApiOperation({ summary: 'Get cached routes for a user journey' })
  @ApiQuery({ name: 'user_id', example: 1, description: 'User ID' })
  @ApiQuery({ name: 'origin', example: 'SMU', description: 'Origin location' })
  @ApiQuery({
    name: 'destination',
    example: 'Changi Airport',
    description: 'Destination location',
  })
  @ApiResponse({
    status: 200,
    description: 'Cached routes retrieved',
    schema: {
      example: {
        route_id: 1,
        user_id: 1,
        origin_label: 'SMU',
        destination_label: 'Changi Airport',
        search_status: 'SELECTED',
        is_locked: true,
        selected_option_id: 2,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to get routes',
    schema: {
      example: {
        message: 'Failed to get routes',
        error: 'Internal Server Error',
        statusCode: 500,
      },
    },
  })
  async getRoutes(
    @Query('user_id') user_id: number,
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return this.routePlannerOrchestratorServiceService.getRoutes(
      user_id,
      origin,
      destination,
    );
  }

  @Post('disrupt')
  @ApiOperation({
    summary:
      'Simulate a line disruption — unlocks route, publishes RabbitMQ event, notifies user',
  })
  @ApiBody({
    schema: {
      example: { route_id: 1, disrupted_line: 'EW' },
      properties: {
        route_id: {
          type: 'number',
          example: 1,
          description: 'Route ID to mark as disrupted',
        },
        disrupted_line: {
          type: 'string',
          example: 'EW',
          description: 'MRT/Bus line that is disrupted',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Disruption handled — route unlocked, notification sent via RabbitMQ and HTTP',
    schema: {
      example: {
        message: 'Disruption handled for route 1',
        route_id: 1,
        disrupted_line: 'EW',
        search_status: 'DISRUPTED',
        is_locked: false,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found or does not use disrupted line',
    schema: {
      example: {
        message: 'Route not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async handleDisruption(
    @Body('route_id') route_id: number,
    @Body('disrupted_line') disrupted_line: string,
  ) {
    return this.routePlannerOrchestratorServiceService.handleDisruption(route_id, disrupted_line);
  }
}
