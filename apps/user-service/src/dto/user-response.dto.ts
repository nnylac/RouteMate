export class UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  username: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
