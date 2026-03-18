import { Module } from '@nestjs/common';
import { RouteCacheServiceController } from './route-cache-service.controller';
import { RouteCacheService } from './route-cache-service.service';
import { MongooseModule } from '@nestjs/mongoose';
// eslint-disable-next-line prettier/prettier
import { RouteCache, RouteCacheSchema } from '../schemas/route-cache-service-schemas';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/route-cache-service/.env',
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    MongooseModule.forFeature([
      { name: RouteCache.name, schema: RouteCacheSchema },
    ]),
  ],
  controllers: [RouteCacheServiceController],
  providers: [RouteCacheService],
})
export class RouteCacheServiceModule {}
