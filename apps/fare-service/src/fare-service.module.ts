import { Module } from '@nestjs/common';
import { FareServiceController } from './fare-service.controller';
import { FareService } from './fare-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PtFareRule } from './entities/pt-fare-rule.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/fare-service/.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.getOrThrow<string>('POSTGRES_HOST'),
        port: Number(configService.getOrThrow<string>('POSTGRES_PORT')),
        username: configService.getOrThrow<string>('POSTGRES_USER'),
        password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
        database: 'fare_service_db',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([PtFareRule]),
  ],
  controllers: [FareServiceController],
  providers: [FareService],
})
export class FareServiceModule {}
