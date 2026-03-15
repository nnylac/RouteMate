import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FareServiceModule } from 'apps/fare-service/src/fare-service.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), FareServiceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
