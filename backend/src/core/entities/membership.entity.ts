import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['segmentId', 'customerId'], { unique: true })
export class SegmentMembership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  segmentId: string;

  @Column()
  customerId: string;

  @CreateDateColumn()
  detectedAt: Date;
}
