import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import { RouteCacheService } from './route-cache-service.service';

@Controller('route-cache')
export class RouteCacheServiceController {
  constructor(private readonly routeCacheService: RouteCacheService) {}

  @Get()
  async getCachedRoute(
    @Query('user_id') userId: number,
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return await this.routeCacheService.findCachedRoute(
      Number(userId),
      origin,
      destination,
    );
  }

  @Get('by-route-id')
  async getRouteById(@Query('route_id') routeId: number) {
    return await this.routeCacheService.findRouteById(Number(routeId));
  }

  @Post()
  async saveRouteCache(@Body() body: Partial<any>) {
    return await this.routeCacheService.saveRouteCache(body);
  }

  @Delete()
  async deleteRouteCache(
    @Query('user_id') userId: number,
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return await this.routeCacheService.deleteRouteCache(
      Number(userId),
      origin,
      destination,
    );
  }

  @Patch('select-option')
  async selectRouteOption(
    @Query('route_id') routeId: number,
    @Query('option_id') optionId: number,
  ) {
    return await this.routeCacheService.selectRouteOption(
      Number(routeId),
      Number(optionId),
    );
  }
}
