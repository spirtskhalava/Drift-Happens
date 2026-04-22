import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ default: 0 })
  transactionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTransactionAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
