import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from '../schemas/user-service-schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  getHello(): string {
    return 'user service is running';
  }

  private toUserResponse(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      createdAt: (user as User & { createdAt?: Date }).createdAt,
      updatedAt: (user as User & { updatedAt?: Date }).updatedAt,
    };
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }
  }

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingEmail = await this.userModel.findOne({
      email: createUserDto.email.toLowerCase(),
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingUsername = await this.userModel.findOne({
      username: createUserDto.username,
    });

    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      fullName: createUserDto.fullName,
      email: createUserDto.email.toLowerCase(),
      username: createUserDto.username,
      passwordHash,
      isActive: true,
    });

    const savedUser = await user.save();
    return this.toUserResponse(savedUser);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userModel
      .findOne({
        $or: [
          { email: loginDto.usernameOrEmail.toLowerCase() },
          { username: loginDto.usernameOrEmail },
        ],
      })
      .select('+passwordHash')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      message: 'Login successful',
      user: this.toUserResponse(user),
    };
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => this.toUserResponse(user));
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.validateObjectId(id);

    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email) {
      const normalizedEmail = updateUserDto.email.toLowerCase();

      const existingEmail = await this.userModel.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }

      user.email = normalizedEmail;
    }

    if (updateUserDto.username) {
      const existingUsername = await this.userModel.findOne({
        username: updateUserDto.username,
        _id: { $ne: id },
      });

      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }

      user.username = updateUserDto.username;
    }

    if (updateUserDto.fullName) {
      user.fullName = updateUserDto.fullName;
    }

    const updatedUser = await user.save();
    return this.toUserResponse(updatedUser);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    this.validateObjectId(id);

    const user = await this.userModel
      .findById(id)
      .select('+passwordHash')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await user.save();

    return { message: 'Password changed successfully' };
  }
}
