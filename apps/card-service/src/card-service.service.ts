import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card } from '../schemas/card-service-schema';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name)
    private readonly cardModel: Model<Card>,
  ) {}

  getHello(): string {
    return 'card service is running';
  }

  async createTestCard(): Promise<Card> {
    const card = new this.cardModel({
      userId: 'user_001',
      cardNumber: 'CARD0001',
      cardType: 'adult',
      balance: 25,
      status: 'active',
    });

    return card.save();
  }

  async getAllCards(): Promise<Card[]> {
    return this.cardModel.find().exec();
  }
}
