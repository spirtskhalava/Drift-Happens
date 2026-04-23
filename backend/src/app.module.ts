import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { SegmentsModule } from './segments/segments.module';
import { Customer } from './core/entities/customer.entity';
import { Segment } from './core/entities/segment.entity';
import { SegmentMembership } from './core/entities/membership.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'drift_db',
      entities: [Customer, Segment, SegmentMembership],
      synchronize: true,
    }),
    BullModule.forRoot({
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    SegmentsModule,
  ],
})
export class AppModule {}
