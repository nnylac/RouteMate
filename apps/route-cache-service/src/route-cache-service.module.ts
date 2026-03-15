import { Module } from '@nestjs/common';
import { RouteCacheServiceController } from './route-cache-service.controller';
import { RouteCacheService } from './route-cache-service.service';
import { MongooseModule } from '@nestjs/mongoose';
// eslint-disable-next-line prettier/prettier
import { RouteCache, RouteCacheSchema } from '../schemas/route-cache-service-schemas';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://root:root@localhost:27017/route_cache_db?authSource=admin',
    ),
    MongooseModule.forFeature([
      { name: RouteCache.name, schema: RouteCacheSchema },
    ]),
  ],
  controllers: [RouteCacheServiceController],
  providers: [RouteCacheService],
})
export class RouteCacheServiceModule {}
