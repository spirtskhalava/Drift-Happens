import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Segment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'simple-array', nullable: true })
  dependsOn: string[];

  @Column({ type: 'enum', enum: ['dynamic', 'static'] })
  type: string;

  @Column({ type: 'jsonb' })
  rules: any;

  @CreateDateColumn()
  createdAt: Date;
}
