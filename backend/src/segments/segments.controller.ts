import { Controller, Post, Param, Get, Body, Logger } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Segment } from '../core/entities/segment.entity';
import { Repository } from 'typeorm';

@Controller('segments')
export class SegmentsController {
  private readonly logger = new Logger(SegmentsController.name);

  constructor(
    private readonly segmentsService: SegmentsService,
    @InjectRepository(Segment) private segmentRepo: Repository<Segment>,
    @InjectQueue('segment-calculation') private segmentQueue: Queue,
  ) {}

  
  @Get()
  async findAll() {
    return await this.segmentRepo.find();
  }

  
  @Post(':id/evaluate')
  async evaluate(@Param('id') id: string) {
    await this.segmentQueue.add(
      'evaluate',
      { segmentId: id },
      { 
        jobId: id,
        delay: 5000ს
        removeOnComplete: true 
      },
    );

    this.logger.log(`Evaluation for segment ${id} queued 5s delay`);
    return { message: 'Evaluation scheduled, wait for 5 minutes' };
  }

  
  @Post('simulate-transaction/:customerId')
  async simulateTransaction(
    @Param('customerId') customerId: string,
    @Body('amount') amount: number,
  ) {
    
    const dynamicSegments = await this.segmentRepo.find({ where: { type: 'dynamic' } });

    for (const segment of dynamicSegments) {
      await this.segmentQueue.add(
        'evaluate',
        { segmentId: segment.id },
        { jobId: segment.id, delay: 2000, removeOnComplete: true },
      );
    }

    return { 
      message: `Transaction (${amount}₾) based on client  ${customerId}.Segment evaluation started`,
      affectedSegments: dynamicSegments.length
    };
  }

 
  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return await this.segmentsService.getSegmentMembers(id);
  }
}
