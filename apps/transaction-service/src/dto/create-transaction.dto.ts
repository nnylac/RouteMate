import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';

export class CreateTransactionDto {
  @ApiProperty({ example: 'user123', description: 'User ID', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  userId: string;

  @ApiPropertyOptional({
    example: '6614a2f3c9b1234567890abc',
    description: 'MongoDB card _id',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  cardId?: string;

  @ApiProperty({
    enum: TransactionType,
    example: 'top_up',
    description: 'Type of transaction',
  })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({
    example: '20.00',
    description: 'Transaction amount as string',
  })
  @IsNumberString()
  amount: string;

  @ApiProperty({
    enum: TransactionStatus,
    example: 'pending',
    description: 'Transaction status',
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiPropertyOptional({
    example: 'REF123',
    description: 'Internal reference',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  reference?: string;

  @ApiPropertyOptional({
    example: 'pi_stripe123',
    description: 'Stripe PaymentIntent ID',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  paymentReference?: string;
}
