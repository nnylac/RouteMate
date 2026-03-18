import { Module } from '@nestjs/common';
import { TransactionServiceController } from './transaction-service.controller';
import { TransactionService } from './transaction-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Transaction } from './entities/transaction.entity';

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
        // eslint-disable-next-line prettier/prettier
        database: configService.get<string>('POSTGRES_DB') ?? 'transaction_service_db',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Transaction]),
  ],
  controllers: [TransactionServiceController],
  providers: [TransactionService],
})
export class TransactionServiceModule {}
