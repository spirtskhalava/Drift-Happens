import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';
import { SegmentsProcessor } from './segments.processor';
import { Customer } from '../core/entities/customer.entity';
import { Segment } from '../core/entities/segment.entity';
import { SegmentMembership } from '../core/entities/membership.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Segment, SegmentMembership]),
    BullModule.registerQueue({
      name: 'segment-calculation',
    }),
  ],
  providers: [SegmentsService, SegmentsProcessor],
  controllers: [SegmentsController],
})
export class SegmentsModule {}
