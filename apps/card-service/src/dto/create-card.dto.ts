import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty({
    description: 'ID of the user this card belongs to',
    example: 'user123',
  })
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'Type of card',
    enum: ['adult', 'student', 'senior'],
    example: 'adult',
  })
  @IsString()
  @IsIn(['adult', 'student', 'senior'])
  cardType!: string;
}
