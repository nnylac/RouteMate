import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRefundDto {
  @ApiProperty({
    example: 'pi_stripe123',
    description: 'Stripe PaymentIntent ID to refund',
  })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  @ApiPropertyOptional({
    example: 10.0,
    description: 'Partial refund amount in SGD dollars — omit for full refund',
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
