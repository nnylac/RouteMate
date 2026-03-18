import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user-service.service';
import { User } from '../schemas/user-service-schema';

@Controller('user-service')
export class UserServiceController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  @Post('test')
  async createTestUser(): Promise<User> {
    return this.userService.createTestUser();
  }

  @Get('users')
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }
}
