import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  RouteCache,
  RouteCacheDocument,
} from '../schemas/route-cache-service-schemas';
import { RouteSearchStatus } from './enums/route-cache.enums';

@Injectable()
export class RouteCacheService {
  constructor(
    @InjectModel(RouteCache.name)
    private routeCacheModel: Model<RouteCacheDocument>,
  ) {}

  async findCachedRoute(userId: number, origin: string, destination: string) {
    return await this.routeCacheModel.findOne({
      user_id: userId,
      origin_label: origin,
      destination_label: destination,
    });
  }

  async findRouteById(routeId: number) {
    const route = await this.routeCacheModel.findOne({ route_id: routeId });

    if (!route) {
      throw new NotFoundException(`Route with route_id ${routeId} not found`);
    }

    return route;
  }

  async saveRouteCache(body: Partial<RouteCache>) {
    return this.routeCacheModel.findOneAndUpdate(
      { route_id: body.route_id },
      body,
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );
  }

  async deleteRouteCache(
    userId: number,
    origin: string,
    destination: string,
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    return this.routeCacheModel.deleteOne({
      user_id: userId,
      origin_label: origin,
      destination_label: destination,
    });
  }

  async selectRouteOption(routeId: number, optionId: number) {
    const route = await this.routeCacheModel.findOne({ route_id: routeId });

    if (!route) {
      throw new NotFoundException(`Route with route_id ${routeId} not found`);
    }

    const optionExists = route.route_options.some(
      (option) => option.option_id === optionId,
    );

    if (!optionExists) {
      throw new BadRequestException(
        `Option ${optionId} does not exist for route ${routeId}`,
      );
    }

    route.selected_option_id = optionId;
    route.is_locked = true;
    route.search_status = RouteSearchStatus.SELECTED;

    return route.save();
  }

  async getRoutesByUser(userId: number) {
    return this.routeCacheModel
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(10);
  }
}
