import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from '../schemas/card-service-schema';
import { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name)
    private readonly cardModel: Model<CardDocument>,
  ) {}

  getHello(): string {
    return 'card service is running';
  }

  private async generateUniqueCardNumber(): Promise<string> {
    let exists = true;
    let cardNumber = '';

    while (exists) {
      const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
      cardNumber = `CARD${randomDigits}`;

      const existingCard = await this.cardModel.findOne({ cardNumber }).exec();
      exists = !!existingCard;
    }

    return cardNumber;
  }

  async createCard(createCardDto: CreateCardDto): Promise<CardDocument> {
    const cardNumber = await this.generateUniqueCardNumber();

    const card = new this.cardModel({
      ...createCardDto,
      cardNumber,
      balance: 0,
      status: 'active',
    });

    return card.save();
  }

  async getAllCards(): Promise<CardDocument[]> {
    return this.cardModel.find().exec();
  }

  async getCardsByUser(userId: string): Promise<CardDocument[]> {
    return this.cardModel.find({ userId }).exec();
  }

  async getCardById(id: string): Promise<CardDocument | null> {
    const card = await this.cardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    return card;
  }

  async getCardByCardNumber(cardNumber: string): Promise<CardDocument> {
    const card = await this.cardModel.findOne({ cardNumber }).exec();

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card;
  }

  async topUpCard(id: string, amount: number): Promise<CardDocument | null> {
    if (amount <= 0) {
      throw new BadRequestException('Top up amount must be greater than 0');
    }

    const updated = await this.cardModel
      .findByIdAndUpdate(id, { $inc: { balance: amount } }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Card not found');
    }

    return updated;
  }

  async deductFare(id: string, amount: number): Promise<CardDocument | null> {
    if (amount <= 0) {
      throw new BadRequestException('Deduction amount must be greater than 0');
    }

    const card = await this.cardModel.findById(id).exec();

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.status !== 'active') {
      throw new BadRequestException('Card is not active');
    }

    if (card.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    card.balance -= amount;
    return card.save();
  }

  async updateCardStatus(
    id: string,
    status: string,
  ): Promise<CardDocument | null> {
    const updated = await this.cardModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Card not found');
    }

    return updated;
  }
}
