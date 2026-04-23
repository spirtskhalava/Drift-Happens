import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { SegmentsService } from './segments.service';
import { Logger } from '@nestjs/common';

@Processor('segment-calculation')
export class SegmentsProcessor {
  private readonly logger = new Logger('SegmentsProcessor');

  constructor(private readonly segmentsService: SegmentsService) { }

  @Process('evaluate')
  async handleEvaluation(job: Job<{ segmentId: string }>) {
    const { segmentId } = job.data;
    this.logger.log(`The processor has taken over the task on the segment: ${segmentId}`);

    try {
      const result = await this.segmentsService.evaluateSegment(segmentId);
      this.logger.log(`Recalculation completed successfully for the segment.: ${segmentId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      throw error;
    }
  }
}
