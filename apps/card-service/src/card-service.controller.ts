import { Controller, Get, Post } from '@nestjs/common';
import { CardService } from './card-service.service';
import { Card } from '../schemas/card-service-schema';

@Controller('card-service')
export class CardServiceController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  getHello(): string {
    return this.cardService.getHello();
  }

  @Post('test')
  async createTestCard(): Promise<Card> {
    return this.cardService.createTestCard();
  }

  @Get('cards')
  async getAllCards(): Promise<Card[]> {
    return this.cardService.getAllCards();
  }
}
