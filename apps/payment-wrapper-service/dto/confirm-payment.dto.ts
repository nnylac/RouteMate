import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({
    example: 'pi_stripe123',
    description: 'Stripe PaymentIntent ID to confirm',
  })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  @ApiPropertyOptional({
    example: 'pm_card_visa',
    description:
      'Stripe test payment method. Use pm_card_visa for success, pm_card_visa_chargeDeclined for decline',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
