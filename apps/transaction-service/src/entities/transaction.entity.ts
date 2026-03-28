import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

@Entity({ name: 'transactions' })
@Index(['userId'])
@Index(['cardId'])
@Index(['transactionType', 'status'])
export class Transaction {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'transaction_id',
  })
  transactionId: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'card_id',
    nullable: true,
  })
  cardId: string | null;

  @Column({
    type: 'enum',
    enum: TransactionType,
    name: 'transaction_type',
  })
  transactionType: TransactionType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'amount',
  })
  amount: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    name: 'status',
  })
  status: TransactionStatus;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'reference',
    unique: true,
    nullable: true,
  })
  reference: string | null;

  // Stripe PaymentIntent ID — set when a payment intent is created
  @Column({
    type: 'varchar',
    length: 255,
    name: 'payment_reference',
    unique: true,
    nullable: true,
  })
  paymentReference: string | null;

  // Populated when status = failed
  @Column({
    type: 'text',
    name: 'failure_reason',
    nullable: true,
  })
  failureReason: string | null;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;
}
