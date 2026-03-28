import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionServiceController } from './transaction-service.controller';
import { TransactionService } from './transaction-service.service';
import { Transaction } from './entities/transaction.entity';
import { RabbitMQPublisher } from './publisher/rabbitmq.publisher';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/transaction-service/.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.getOrThrow<string>('POSTGRES_HOST'),
        port: Number(configService.getOrThrow<string>('POSTGRES_PORT')),
        username: configService.getOrThrow<string>('POSTGRES_USER'),
        password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
        database:
          configService.get<string>('POSTGRES_DB') ?? 'transaction_service_db',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Transaction]),
  ],
  controllers: [TransactionServiceController],
  providers: [TransactionService, RabbitMQPublisher],
})
export class TransactionServiceModule {}
