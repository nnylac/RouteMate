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
  })
  reference: string;

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
