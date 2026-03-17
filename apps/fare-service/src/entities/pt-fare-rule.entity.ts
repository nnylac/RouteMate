import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity({ name: 'pt_fare_rules' })
@Unique([
  'transportMode',
  'fareCategory',
  'applicableTime',
  'distanceFromKm',
  'distanceToKm',
])
@Index(['transportMode', 'fareCategory'])
export class PtFareRule {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'fare_rule_id',
  })
  fareRuleId: string;

  @Column({
    type: 'varchar',
    length: 30,
    name: 'transport_mode',
  })
  transportMode: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'fare_category',
  })
  fareCategory: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'applicable_time',
    nullable: true,
  })
  applicableTime: string | null;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    name: 'distance_from_km',
  })
  distanceFromKm: string;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    name: 'distance_to_km',
  })
  distanceToKm: string;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    name: 'fare_amount',
  })
  fareAmount: string;

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
