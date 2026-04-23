import { DataSource } from 'typeorm';
import { Customer } from './core/entities/customer.entity';
import { Segment } from './core/entities/segment.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'drift_db',
  entities: [Customer, Segment],
  synchronize: true,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source initialized!');

    const customerRepo = AppDataSource.getRepository(Customer);
    const segmentRepo = AppDataSource.getRepository(Segment);

    const customers: Customer[] = []; 
    for (let i = 1; i <= 50; i++) {
      const c = new Customer();
      c.firstName = `Customer_${i}`;
      c.lastName = `Test`;
      c.totalSpent = Math.floor(Math.random() * 10000);
      c.transactionCount = Math.floor(Math.random() * 15);
      customers.push(c);
    }
    await customerRepo.save(customers);
    console.log('50 Customers created');

    const vip = new Segment();
    vip.name = 'VIP clients (>5000gel)';
    vip.type = 'dynamic';
    vip.rules = { minSpent: 5000 };
    const savedVip = await segmentRepo.save(vip);

    const march = new Segment();
    march.name = 'March campaign';
    march.type = 'static';
    march.rules = {};
    await segmentRepo.save(march);
    const risk = new Segment();
    risk.name = 'VIP risk group (VIP + >8000gel)';
    risk.type = 'dynamic';
    risk.rules = { minSpent: 8000 };
    risk.dependsOn = [savedVip.id]; 
    await segmentRepo.save(risk);

    console.log('All Segments created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
