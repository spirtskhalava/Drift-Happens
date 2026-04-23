import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Customer } from '../core/entities/customer.entity';
import { Segment } from '../core/entities/segment.entity';
import { SegmentMembership } from '../core/entities/membership.entity';

@Injectable()
export class SegmentsService {
  private readonly logger = new Logger('SegmentsService');
  private deltaCache = new Map<string, { added: number; removed: number; evaluatedAt: Date }>();

  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Segment) private segmentRepo: Repository<Segment>,
    @InjectRepository(SegmentMembership) private membershipRepo: Repository<SegmentMembership>,
  ) { }


  async evaluateSegment(segmentId: string) {
    const segment = await this.segmentRepo.findOne({ where: { id: segmentId } });
    if (!segment) return;

    this.logger.log(`Segment: ${segment.name}`);

    const currentIds = await this.resolveSegmentMembers(segment);

    const oldMemberships = await this.membershipRepo.find({ where: { segmentId } });
    const oldIds = oldMemberships.map(m => m.customerId);

    const added = currentIds.filter(id => !oldIds.includes(id));
    const removed = oldIds.filter(id => !currentIds.includes(id));

    if (added.length === 0 && removed.length === 0) {
      this.logger.log(`[${segment.name}] ცვლილება არ არის.`);
      return { message: 'No changes', delta: { added: 0, removed: 0 } };
    }

    if (added.length > 0) {

      const newEntries = added.map(id => ({ segmentId, customerId: id }));
      await this.membershipRepo.insert(newEntries);
    }

    if (removed.length > 0) {
      await this.membershipRepo.delete({ segmentId, customerId: In(removed) });
    }

    this.logger.log(`[${segment.name}] updated: +${added.length}, -${removed.length}`);
    this.deltaCache.set(segmentId, { added: added.length, removed: removed.length, evaluatedAt: new Date() });

    const allSegments = await this.segmentRepo.find();
    for (const depSegment of allSegments) {
      if (depSegment.dependsOn && depSegment.dependsOn.includes(segmentId)) {
        this.logger.log(`🔗 trigger for segment: ${depSegment.name}`);
        await this.evaluateSegment(depSegment.id);
      }
    }

    return { segment: segment.name, delta: { added: added.length, removed: removed.length } };
  }


  private async resolveSegmentMembers(segment: Segment): Promise<string[]> {
    const query = this.customerRepo.createQueryBuilder('customer');

    if (segment.rules && segment.rules.minSpent) {
      query.andWhere('customer.totalSpent >= :minSpent', { minSpent: segment.rules.minSpent });
    }

    if (segment.dependsOn && segment.dependsOn.length > 0) {
      const subQuery = this.membershipRepo
        .createQueryBuilder('m')
        .select('m.customerId')
        .where('m.segmentid in (:...ids)', { ids: segment.dependsOn });


      query.andWhere(`customer.id IN (${subQuery.getQuery()})`)
        .setParameters(subQuery.getParameters());
    }

    const customers = await query.getMany();
    return customers.map(c => c.id);
  }

  getLastDelta(segmentId: string) {
    return this.deltaCache.get(segmentId) ?? null;
  }

  async getSegmentMembers(segmentId: string) {
    return await this.customerRepo
      .createQueryBuilder('customer')
      .innerJoin(SegmentMembership, 'm', 'm.customerId = customer.id')
      .where('m.segmentId = :segmentId', { segmentId })
      .getMany();
  }
}
