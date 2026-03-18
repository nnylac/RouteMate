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
import { CreateRouteCacheDto } from './dto/create-route-cache.dto';
import { GetCachedRouteDto } from './dto/get-cached-route.dto';
import { DeleteRouteCacheDto } from './dto/delete-route-cache.dto';
import { GetRouteByIdDto } from './dto/get-route-by-id.dto';
import { SelectRouteOptionDto } from './dto/select-route-option.dto';

@Controller('route-cache')
export class RouteCacheServiceController {
  constructor(private readonly routeCacheService: RouteCacheService) {}

  @Get()
  async getCachedRoute(@Query() query: GetCachedRouteDto) {
    return this.routeCacheService.findCachedRoute(
      query.user_id,
      query.origin,
      query.destination,
    );
  }

  @Get('by-route-id')
  async getRouteById(@Query() query: GetRouteByIdDto) {
    return await this.routeCacheService.findRouteById(query.route_id);
  }

  @Post()
  async saveRouteCache(@Body() body: CreateRouteCacheDto) {
    return this.routeCacheService.saveRouteCache(body);
  }

  @Delete()
  async deleteRouteCache(@Query() query: DeleteRouteCacheDto) {
    return this.routeCacheService.deleteRouteCache(
      query.user_id,
      query.origin,
      query.destination,
    );
  }

  @Patch('select-option')
  async selectRouteOption(@Query() query: SelectRouteOptionDto) {
    return this.routeCacheService.selectRouteOption(
      query.route_id,
      query.option_id,
    );
  }

  @Get('user-history')
  async getUserRouteHistory(@Query('user_id') userId: number) {
    return this.routeCacheService.getRoutesByUser(Number(userId));
  }
}
