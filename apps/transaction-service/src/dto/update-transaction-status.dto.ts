import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus } from '../enums/transaction-status.enum';

export class UpdateTransactionStatusDto {
  @ApiProperty({
    enum: TransactionStatus,
    example: 'success',
    description: 'New transaction status',
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiPropertyOptional({
    example: 'Card balance update failed after payment',
    description: 'Reason for failure or rollback',
  })
  @IsOptional()
  @IsString()
  failureReason?: string;
}
