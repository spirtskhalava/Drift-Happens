import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SegmentsService } from './segments.service';

@Processor('segment-calculation')
export class SegmentsProcessor {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Process('evaluate')
  async handleEvaluation(job: Job) {
    const { segmentId } = job.data;
    await this.segmentsService.evaluateSegment(segmentId);
  }
}
