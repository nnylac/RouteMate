import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RoutePlannerOrchestratorServiceController } from './route-planner-orchestrator-service.controller';
import { RoutePlannerOrchestratorServiceService } from './route-planner-orchestrator-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'route_events',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [RoutePlannerOrchestratorServiceController],
  providers: [RoutePlannerOrchestratorServiceService],
})
export class RoutePlannerOrchestratorServiceModule {}