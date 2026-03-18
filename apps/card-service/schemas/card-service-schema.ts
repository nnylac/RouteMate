import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CardDocument = HydratedDocument<Card>;

@Schema({
  collection: 'cards',
  timestamps: true,
})
export class Card {
  @Prop({ required: true, trim: true })
  userId: string;

  @Prop({ required: true, unique: true, trim: true })
  cardNumber: string;

  @Prop({ required: true, trim: true })
  cardType: string;

  @Prop({ required: true, default: 0 })
  balance: number;

  @Prop({ required: true, default: 'active', trim: true })
  status: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);
