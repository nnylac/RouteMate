import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  RouteCache,
  RouteCacheDocument,
} from '../schemas/route-cache-service-schemas';

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
    return await this.routeCacheModel.findOne({
      route_id: routeId,
    });
  }

  async saveRouteCache(body: Partial<RouteCache>) {
    const newRoute = new this.routeCacheModel(body);
    return await newRoute.save();
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
    return await this.routeCacheModel.findOneAndUpdate(
      { route_id: routeId },
      {
        selected_option_id: optionId,
        is_locked: true,
        search_status: 'SELECTED',
      },
      { new: true },
    );
  }
}
