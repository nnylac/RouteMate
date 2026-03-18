import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user-service-schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  getHello(): string {
    return 'user service is running';
  }

  async createTestUser(): Promise<User> {
    const user = new this.userModel({
      fullName: 'Calynn Ong',
      email: 'calynn@example.com',
      username: 'calynnong',
      passwordHash: 'mockhashedpassword',
      isActive: true,
    });

    return user.save();
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
