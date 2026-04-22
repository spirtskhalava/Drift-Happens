import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Segment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['dynamic', 'static'] })
  type: string;

  @Column({ type: 'jsonb' })
  rules: any; // მაგ: { "minSpent": 5000 }

  @CreateDateColumn()
  createdAt: Date;
}
