import { createConnection } from 'typeorm';
import { Customer } from './core/entities/customer.entity';
import { Segment } from './core/entities/segment.entity';

async function seed() {
  const connection = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'user',
    password: 'password',
    database: 'drift_db',
    entities: [Customer, Segment],
    synchronize: true,
  });

  const customerRepo = connection.getRepository(Customer);
  
  
  for (let i = 0; i < 10; i++) {
    const c = new Customer();
    c.firstName = `Customer ${i}`;
    c.lastName = `Test`;
    c.totalSpent = Math.floor(Math.random() * 10000);
    c.transactionCount = Math.floor(Math.random() * 20);
    await customerRepo.save(c);
  }

  console.log('Seed finished!');
  await connection.close();
}

seed();
