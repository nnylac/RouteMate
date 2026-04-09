import { IsNumber, IsOptional, IsObject, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({
    example: 20.0,
    description: 'Amount in SGD dollars (min $0.01)',
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({
    example: 'sgd',
    description: 'Currency code — defaults to sgd',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: { userId: 'user123', cardId: '6614a2f3c9b1234567890abc' },
    description: 'Optional metadata attached to the payment intent',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
