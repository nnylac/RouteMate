import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBalanceDto {
  @ApiProperty({
    description: 'Amount to top up or deduct (must be > 0)',
    example: 20.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;
}
