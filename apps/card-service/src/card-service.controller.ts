import { Controller, Get, Post, Param, Patch, Body } from '@nestjs/common';
import { CardService } from './card-service.service';
import { CardDocument } from '../schemas/card-service-schema';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('card-service')
export class CardServiceController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  getHello(): string {
    return this.cardService.getHello();
  }

  @Post('cards')
  async createCard(
    @Body() createCardDto: CreateCardDto,
  ): Promise<CardDocument> {
    return this.cardService.createCard(createCardDto);
  }

  @Get('cards')
  async getAllCards(): Promise<CardDocument[]> {
    return this.cardService.getAllCards();
  }

  @Get('cards/user/:userId')
  async getCardsByUser(
    @Param('userId') userId: string,
  ): Promise<CardDocument[]> {
    return this.cardService.getCardsByUser(userId);
  }

  @Get('cards/number/:cardNumber')
  async getCardByCardNumber(
    @Param('cardNumber') cardNumber: string,
  ): Promise<CardDocument> {
    return this.cardService.getCardByCardNumber(cardNumber);
  }

  @Get('cards/:id')
  async getCardById(@Param('id') id: string): Promise<CardDocument | null> {
    return this.cardService.getCardById(id);
  }

  @Patch('cards/:id/topup')
  async topUpCard(
    @Param('id') id: string,
    @Body() body: UpdateBalanceDto,
  ): Promise<CardDocument | null> {
    return this.cardService.topUpCard(id, body.amount);
  }

  @Patch('cards/:id/deduct')
  async deductFare(
    @Param('id') id: string,
    @Body() body: UpdateBalanceDto,
  ): Promise<CardDocument | null> {
    return this.cardService.deductFare(id, body.amount);
  }

  @Patch('cards/:id/status')
  async updateCardStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
  ): Promise<CardDocument | null> {
    return this.cardService.updateCardStatus(id, body.status);
  }
}
