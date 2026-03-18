import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  userId: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  cardId?: string;

  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsNumberString()
  amount: string;

  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  reference?: string;
}
