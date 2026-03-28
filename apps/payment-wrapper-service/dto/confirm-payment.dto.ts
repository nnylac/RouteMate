import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  // Stripe test payment methods:
  //   pm_card_visa              → success
  //   pm_card_visa_chargeDeclined → card declined
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
