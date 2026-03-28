import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRefundDto {
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  // Omit for full refund; provide for partial refund (SGD dollars)
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
