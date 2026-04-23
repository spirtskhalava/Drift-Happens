import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('segment_memberships')
@Index(['segmentId', 'customerId'], { unique: true })
export class SegmentMembership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  segmentId: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @CreateDateColumn()
  detectedAt: Date;
}
