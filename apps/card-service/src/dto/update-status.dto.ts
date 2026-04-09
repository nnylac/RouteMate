import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'New card status',
    enum: ['active', 'blocked', 'inactive'],
    example: 'active',
  })
  @IsString()
  @IsIn(['active', 'blocked', 'inactive'])
  status!: string;
}
