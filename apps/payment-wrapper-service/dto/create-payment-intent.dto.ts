import {
  IsNumber,
  IsOptional,
  IsObject,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string; // defaults to 'sgd'

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
