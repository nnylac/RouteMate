import { Module } from '@nestjs/common';
import { CardServiceController } from './card-service.controller';
import { CardService } from './card-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Card, CardSchema } from '../schemas/card-service-schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/card-service/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
      }),
    }),
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
  ],

  controllers: [CardServiceController],
  providers: [CardService],
})
export class CardServiceModule {}
