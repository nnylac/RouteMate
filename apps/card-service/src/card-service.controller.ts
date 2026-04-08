import { Controller, Get, Post, Param, Patch, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CardService } from './card-service.service';
import { CardDocument } from '../schemas/card-service-schema';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('Card Service')
@Controller('card-service')
export class CardServiceController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Card service is running',
    schema: { example: 'card service is running' },
  })
  getHello(): string {
    return this.cardService.getHello();
  }

  @Post('cards')
  @ApiOperation({ summary: 'Create a new transport card' })
  @ApiBody({
    type: CreateCardDto,
    description: 'Card creation details',
    examples: {
      adult: {
        summary: 'Adult card',
        value: { userId: 'user123', cardType: 'adult' },
      },
      student: {
        summary: 'Student card',
        value: { userId: 'user456', cardType: 'student' },
      },
      senior: {
        summary: 'Senior card',
        value: { userId: 'user789', cardType: 'senior' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Card created successfully',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'user123',
        cardNumber: '1234567890123456',
        cardType: 'adult',
        balance: 0,
        status: 'active',
        createdAt: '2026-04-07T10:00:00.000Z',
        updatedAt: '2026-04-07T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid card type or missing fields',
    schema: {
      example: {
        message: [
          'cardType must be one of the following values: adult, student, senior',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async createCard(
    @Body() createCardDto: CreateCardDto,
  ): Promise<CardDocument> {
    return this.cardService.createCard(createCardDto);
  }

  @Get('cards')
  @ApiOperation({ summary: 'Get all cards' })
  @ApiResponse({
    status: 200,
    description: 'List of all cards',
    schema: {
      example: [
        {
          _id: '6614a2f3c9b1234567890abc',
          userId: 'user123',
          cardNumber: '1234567890123456',
          cardType: 'adult',
          balance: 20.5,
          status: 'active',
          createdAt: '2026-04-07T10:00:00.000Z',
          updatedAt: '2026-04-07T10:00:00.000Z',
        },
      ],
    },
  })
  async getAllCards(): Promise<CardDocument[]> {
    return this.cardService.getAllCards();
  }

  @Get('cards/user/:userId')
  @ApiOperation({ summary: 'Get all cards belonging to a user' })
  @ApiParam({ name: 'userId', description: 'The user ID', example: 'user123' })
  @ApiResponse({
    status: 200,
    description: 'List of cards for the user',
    schema: {
      example: [
        {
          _id: '6614a2f3c9b1234567890abc',
          userId: 'user123',
          cardNumber: '1234567890123456',
          cardType: 'adult',
          balance: 20.5,
          status: 'active',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        message: 'Card not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async getCardsByUser(
    @Param('userId') userId: string,
  ): Promise<CardDocument[]> {
    return this.cardService.getCardsByUser(userId);
  }

  @Get('cards/number/:cardNumber')
  @ApiOperation({ summary: 'Get a card by card number' })
  @ApiParam({
    name: 'cardNumber',
    description: '16-digit card number',
    example: '1234567890123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Card found',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'user123',
        cardNumber: '1234567890123456',
        cardType: 'adult',
        balance: 20.5,
        status: 'active',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Card not found',
    schema: {
      example: {
        message: 'Card not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async getCardByCardNumber(
    @Param('cardNumber') cardNumber: string,
  ): Promise<CardDocument> {
    return this.cardService.getCardByCardNumber(cardNumber);
  }

  @Get('cards/:id')
  @ApiOperation({ summary: 'Get a card by MongoDB ID' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB card _id',
    example: '6614a2f3c9b1234567890abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Card found',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'user123',
        cardNumber: '1234567890123456',
        cardType: 'adult',
        balance: 20.5,
        status: 'active',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Card not found',
    schema: {
      example: {
        message: 'Card not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async getCardById(@Param('id') id: string): Promise<CardDocument | null> {
    return this.cardService.getCardById(id);
  }

  @Patch('cards/:id/topup')
  @ApiOperation({ summary: 'Top up card balance' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB card _id',
    example: '6614a2f3c9b1234567890abc',
  })
  @ApiBody({
    type: UpdateBalanceDto,
    examples: { example: { summary: 'Top up $20', value: { amount: 20.0 } } },
  })
  @ApiResponse({
    status: 200,
    description: 'Balance topped up successfully',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'user123',
        cardNumber: '1234567890123456',
        cardType: 'adult',
        balance: 40.5,
        status: 'active',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Amount must be greater than 0',
    schema: {
      example: {
        message: 'Top up amount must be greater than 0',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Card not found',
    schema: {
      example: {
        message: 'Card not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async topUpCard(
    @Param('id') id: string,
    @Body() body: UpdateBalanceDto,
  ): Promise<CardDocument | null> {
    return this.cardService.topUpCard(id, body.amount);
  }

  @Patch('cards/:id/deduct')
  @ApiOperation({ summary: 'Deduct fare from card balance' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB card _id',
    example: '6614a2f3c9b1234567890abc',
  })
  @ApiBody({
    type: UpdateBalanceDto,
    examples: {
      example: { summary: 'Deduct $1.50 fare', value: { amount: 1.5 } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Fare deducted successfully',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'user123',
        cardNumber: '1234567890123456',
        cardType: 'adult',
        balance: 19.0,
        status: 'active',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient balance or card not active',
    schema: {
      example: {
        message: 'Insufficient balance',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Card not found',
    schema: {
      example: {
        message: 'Card not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async deductFare(
    @Param('id') id: string,
    @Body() body: UpdateBalanceDto,
  ): Promise<CardDocument | null> {
    return this.cardService.deductFare(id, body.amount);
  }

  @Patch('cards/:id/status')
  @ApiOperation({ summary: 'Update card status' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB card _id',
    example: '6614a2f3c9b1234567890abc',
  })
  @ApiBody({
    type: UpdateStatusDto,
    examples: {
      block: { summary: 'Block card', value: { status: 'blocked' } },
      activate: { summary: 'Activate card', value: { status: 'active' } },
      deactivate: { summary: 'Deactivate card', value: { status: 'inactive' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Card status updated successfully',
    schema: {
      example: {
        _id: '6614a2f3c9b1234567890abc',
        userId: 'user123',
        cardNumber: '1234567890123456',
        cardType: 'adult',
        balance: 20.5,
        status: 'blocked',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status value',
    schema: {
      example: {
        message: [
          'status must be one of the following values: active, blocked, inactive',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Card not found',
    schema: {
      example: {
        message: 'Card not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async updateCardStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
  ): Promise<CardDocument | null> {
    return this.cardService.updateCardStatus(id, body.status);
  }
}
