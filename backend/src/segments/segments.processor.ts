import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SegmentsService } from './segments.service';
import { Logger } from '@nestjs/common';

@Processor('segment-calculation')
export class SegmentsProcessor {
  private readonly logger = new Logger(SegmentsProcessor.name);

  constructor(private readonly segmentsService: SegmentsService) {}

 
  @Process('evaluate')
  async handleEvaluation(job: Job<{ segmentId: string }>) {
    const { segmentId } = job.data;
    
    this.logger.log(`Processing evaluation for segment: ${segmentId}`);

    try {
      const result = await this.segmentsService.evaluateSegment(segmentId);
      
      this.logger.log(`Successfully processed segment ${segmentId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to process segment ${segmentId}`, error.stack);
      throw error;
    }
  }
}
