import { UserResponseDto } from './user-response.dto';

export class LoginResponseDto {
  message: string;
  user: UserResponseDto;
}
