import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RouteCacheService } from './route-cache-service.service';
import { CreateRouteCacheDto } from './dto/create-route-cache.dto';
import { GetCachedRouteDto } from './dto/get-cached-route.dto';
import { DeleteRouteCacheDto } from './dto/delete-route-cache.dto';
import { GetRouteByIdDto } from './dto/get-route-by-id.dto';
import { SelectRouteOptionDto } from './dto/select-route-option.dto';

@ApiTags('Route Cache Service')
@Controller('route-cache')
export class RouteCacheServiceController {
  constructor(private readonly routeCacheService: RouteCacheService) {}

  @Get()
  @ApiOperation({ summary: 'Get cached route by user, origin and destination' })
  @ApiQuery({ name: 'user_id', example: 1, description: 'User ID' })
  @ApiQuery({ name: 'origin', example: 'SMU', description: 'Origin location' })
  @ApiQuery({
    name: 'destination',
    example: 'Changi Airport',
    description: 'Destination location',
  })
  @ApiResponse({
    status: 200,
    description: 'Cached route found',
    schema: {
      example: {
        route_id: 1,
        user_id: 1,
        origin_label: 'SMU',
        destination_label: 'Changi Airport',
        search_status: 'GENERATED',
        is_locked: false,
        route_options: [],
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
  async getCachedRoute(@Query() query: GetCachedRouteDto) {
    return this.routeCacheService.findCachedRoute(
      query.user_id,
      query.origin,
      query.destination,
    );
  }

  @Get('by-route-id')
  @ApiOperation({ summary: 'Get cached route by route ID' })
  @ApiQuery({ name: 'route_id', example: 1, description: 'Route ID' })
  @ApiResponse({
    status: 200,
    description: 'Route found',
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
  async getRouteById(@Query() query: GetRouteByIdDto) {
    return await this.routeCacheService.findRouteById(query.route_id);
  }

  @Post()
  @ApiOperation({ summary: 'Save a new route to cache' })
  @ApiBody({
    type: CreateRouteCacheDto,
    examples: {
      example: {
        summary: 'Save route from SMU to Changi',
        value: {
          route_id: 1,
          user_id: 1,
          origin_label: 'SMU',
          destination_label: 'Changi Airport',
          route_payload_json: {},
          search_status: 'GENERATED',
          is_locked: false,
          route_options: [],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Route cached successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    schema: {
      example: {
        message: ['user_id must be an integer'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async saveRouteCache(@Body() body: CreateRouteCacheDto) {
    return this.routeCacheService.saveRouteCache(body);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete cached route by user, origin and destination',
  })
  @ApiQuery({ name: 'user_id', example: 1, description: 'User ID' })
  @ApiQuery({ name: 'origin', example: 'SMU', description: 'Origin location' })
  @ApiQuery({
    name: 'destination',
    example: 'Changi Airport',
    description: 'Destination location',
  })
  @ApiResponse({
    status: 200,
    description: 'Route deleted successfully',
    schema: { example: { message: 'Route deleted successfully' } },
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
  async deleteRouteCache(@Query() query: DeleteRouteCacheDto) {
    return this.routeCacheService.deleteRouteCache(
      query.user_id,
      query.origin,
      query.destination,
    );
  }

  @Patch('select-option')
  @ApiOperation({ summary: 'Select a route option — locks the route' })
  @ApiQuery({ name: 'route_id', example: 1, description: 'Route ID' })
  @ApiQuery({
    name: 'option_id',
    example: 2,
    description: 'Option ID to select',
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
  async selectRouteOption(@Query() query: SelectRouteOptionDto) {
    return this.routeCacheService.selectRouteOption(
      query.route_id,
      query.option_id,
    );
  }

  @Patch('disrupt')
  @ApiOperation({
    summary: 'Mark a route as disrupted — unlocks it for re-search',
  })
  @ApiQuery({
    name: 'route_id',
    example: 1,
    description: 'Route ID to mark as disrupted',
  })
  @ApiResponse({
    status: 200,
    description: 'Route marked as disrupted',
    schema: {
      example: {
        route_id: 1,
        is_locked: false,
        search_status: 'DISRUPTED',
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
  async disruptRoute(@Query('route_id') route_id: number) {
    return this.routeCacheService.disruptRoute(route_id);
  }

  @Get('user-history')
  @ApiOperation({ summary: 'Get all routes searched by a user' })
  @ApiQuery({ name: 'user_id', example: 1, description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'List of routes for the user',
    schema: {
      example: [
        {
          route_id: 1,
          origin_label: 'SMU',
          destination_label: 'Changi Airport',
          search_status: 'SELECTED',
          is_locked: true,
        },
      ],
    },
  })
  async getUserRouteHistory(@Query('user_id') userId: number) {
    return this.routeCacheService.getRoutesByUser(Number(userId));
  }
}
