import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Username or email of the account to reset',
  })
  @IsString()
  @IsNotEmpty()
  usernameOrEmail: string;

  @ApiProperty({
    example: 'newpassword456',
    description: 'New password (min 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
