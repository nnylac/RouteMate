import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '6614a2f3c9b1234567890abc' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: '2026-04-07T10:00:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ example: '2026-04-07T10:00:00.000Z' })
  updatedAt?: Date;
}
