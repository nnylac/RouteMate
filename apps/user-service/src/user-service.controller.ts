import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserService } from './user-service.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('User Service')
@Controller('user-service')
export class UserServiceController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'User service is running',
    schema: { example: 'user service is running' },
  })
  getHello(): string {
    return this.userService.getHello();
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      example: {
        summary: 'New user registration',
        value: {
          fullName: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201, description: 'User registered successfully',
    schema: {
      example: {
        id: '6614a2f3c9b1234567890abc',
        fullName: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        isActive: true,
        createdAt: '2026-04-07T10:00:00.000Z',
        updatedAt: '2026-04-07T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists',
    schema: {
      example: {
        message: 'Email already exists',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with username or email' })
  @ApiBody({
    type: LoginDto,
    examples: {
      byEmail: {
        summary: 'Login with email',
        value: { usernameOrEmail: 'john@example.com', password: 'password123' },
      },
      byUsername: {
        summary: 'Login with username',
        value: { usernameOrEmail: 'johndoe', password: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 201, description: 'Login successful',
    schema: {
      example: {
        message: 'Login successful',
        user: {
          id: '6614a2f3c9b1234567890abc',
          fullName: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.userService.login(loginDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Reset password using username or email' })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      example: {
        summary: 'Reset password',
        value: {
          usernameOrEmail: 'john@example.com',
          newPassword: 'newpassword456',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Password reset successfully',
    schema: { example: { message: 'Password reset successfully' } },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'New password invalid',
    schema: {
      example: {
        message: 'New password must be different from current password',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.userService.forgotPassword(forgotPasswordDto);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    schema: {
      example: [
        {
          id: '6614a2f3c9b1234567890abc',
          fullName: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
          isActive: true,
          createdAt: '2026-04-07T10:00:00.000Z',
          updatedAt: '2026-04-07T10:00:00.000Z',
        },
      ],
    },
  })
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB user _id',
    example: '6614a2f3c9b1234567890abc',
  })
  @ApiResponse({
    status: 200, description: 'User found',
    schema: {
      example: {
        id: '6614a2f3c9b1234567890abc',
        fullName: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        isActive: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB user _id',
    example: '6614a2f3c9b1234567890abc',
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      updateName: {
        summary: 'Update full name',
        value: { fullName: 'Jane Doe' },
      },
      updateEmail: {
        summary: 'Update email',
        value: { email: 'jane@example.com' },
      },
      updateAll: {
        summary: 'Update all fields',
        value: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          username: 'janedoe',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        id: '6614a2f3c9b1234567890abc',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        username: 'janedoe',
        isActive: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email or username already taken',
    schema: {
      example: {
        message: 'Email already exists',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Patch('users/:id/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB user _id',
    example: '6614a2f3c9b1234567890abc',
  })
  @ApiBody({
    type: ChangePasswordDto,
    examples: {
      example: {
        summary: 'Change password',
        value: {
          currentPassword: 'password123',
          newPassword: 'newpassword456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: { example: { message: 'Password changed successfully' } },
  })
  @ApiResponse({
    status: 401,
    description: 'Current password incorrect',
    schema: {
      example: {
        message: 'Current password is incorrect',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'New password same as current',
    schema: {
      example: {
        message: 'New password must be different from current password',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.userService.changePassword(id, changePasswordDto);
  }
}
