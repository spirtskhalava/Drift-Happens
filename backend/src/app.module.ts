import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './core/entities/customer.entity';
import { Segment } from './core/entities/segment.entity';
import { SegmentMembership } from './core/entities/membership.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'drift_db',
      entities: [Customer, Segment, SegmentMembership],
      synchronize: true,
    }),
    
  ],
})
export class AppModule {}
