import { Controller, Post, Param, Get, Body } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { InjectQueue } from '@nestjs/bull';
import { type Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Segment } from '../core/entities/segment.entity';
import { Customer } from '../core/entities/customer.entity';
import { Repository } from 'typeorm';

@Controller('segments')
export class SegmentsController {
  constructor(
    private readonly segmentsService: SegmentsService,
    @InjectRepository(Segment) private segmentRepo: Repository<Segment>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectQueue('segment-calculation') private segmentQueue: Queue,
  ) { }

  @Get()
  async findAll() {
    return await this.segmentRepo.find();
  }

  @Post(':id/evaluate')
  async evaluate(@Param('id') id: string) {
    console.log('Evaluate endpoint hit for segment', id);

    await this.segmentQueue.add(
      'evaluate',
      { segmentId: id },
      { jobId: `eval-${id}-${Date.now()}`, removeOnComplete: true }
    );

    return { status: 'OK', message: 'Evaluation Enqueued' };
  }

  @Post('simulate-transaction/:customerId')
  async simulateTransaction(@Param('customerId') customerId: string) {
    console.log('Simulation endpoint hit ');
    const customers = await this.customerRepo.find();

    for (const c of customers) {
      c.totalSpent = Math.random() > 0.5 ? 9000 : 100;
      await this.customerRepo.save(c);
    }
    console.log('Database Updated');


    const dynamicSegments = await this.segmentRepo.find({ where: { type: 'dynamic' } });
    for (const segment of dynamicSegments) {
      await this.segmentQueue.add('evaluate', { segmentId: segment.id }, { removeOnComplete: true });
    }

    return { status: 'OK', message: 'Simulation Finished' };
  }

  @Get(':id/delta')
  getDelta(@Param('id') id: string) {
    return this.segmentsService.getLastDelta(id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return await this.segmentsService.getSegmentMembers(id);
  }
}