import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Customer } from '../core/entities/customer.entity';
import { Segment } from '../core/entities/segment.entity';
import { SegmentMembership } from '../core/entities/membership.entity';

@Injectable()
export class SegmentsService {
  private readonly logger = new Logger(SegmentsService.name);

  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Segment) private segmentRepo: Repository<Segment>,
    @InjectRepository(SegmentMembership) private membershipRepo: Repository<SegmentMembership>,
  ) {}

  async evaluateSegment(segmentId: string) {
    const segment = await this.segmentRepo.findOne({ where: { id: segmentId } });
    if (!segment) return;

    this.logger.log(`Evaluating segment: ${segment.name}`);

  
    const currentIds = await this.resolveSegmentMembers(segment);

   
    const oldMemberships = await this.membershipRepo.find({ where: { segmentId } });
    const oldIds = oldMemberships.map(m => m.customerId);

    
    const added = currentIds.filter(id => !oldIds.includes(id));
    const removed = oldIds.filter(id => !currentIds.includes(id));

    
    if (added.length === 0 && removed.length === 0) {
      return { message: 'No changes detected', delta: { added: 0, removed: 0 } };
    }

    
    if (added.length > 0) {
      await this.membershipRepo.insert(added.map(id => ({ segmentId, customerId: id })));
    }
    if (removed.length > 0) {
      await this.membershipRepo.delete({ segmentId, customerId: In(removed) });
    }

    this.logger.log(`Segment ${segment.name} updated: +${added.length}, -${removed.length}`);

    
    const dependentSegments = await this.segmentRepo.find();
    for (const dep of dependentSegments) {
      if (dep.dependsOn && dep.dependsOn.includes(segmentId)) {
        this.logger.log(`Triggering dependent segment: ${dep.name}`);
        await this.evaluateSegment(dep.id); // რეკურსიული გამოძახება
      }
    }

    return { segment: segment.name, delta: { added, removed } };
  }

  private async resolveSegmentMembers(segment: Segment): Promise<string[]> {
    const query = this.customerRepo.createQueryBuilder('customer');

    
    if (segment.rules.minSpent) {
      query.andWhere('customer.totalSpent >= :minSpent', { minSpent: segment.rules.minSpent });
    }

    )
    if (segment.dependsOn && segment.dependsOn.length > 0) {
      const subQuery = this.membershipRepo
        .createQueryBuilder('m')
        .select('m.customerId')
        .where('m.segmentId IN (:...ids)', { ids: segment.dependsOn });
      
      query.andWhere(`customer.id IN (${subQuery.getQuery()})`)
        .setParameters(subQuery.getParameters());
    }

    const customers = await query.getMany();
    return customers.map(c => c.id);
  }
}
