import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkDB() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'pizhams',
    password: process.env.DATABASE_PASSWORD || 'pizhams_password',
    database: process.env.DATABASE_NAME || 'pizhams',
  });

  await dataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();
  
  // Check card_sets columns
  const cardSetsCols = await queryRunner.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'card_sets' ORDER BY ordinal_position
  `);
  console.log('card_sets columns:', cardSetsCols.map(r => r.column_name));
  
  // Check cards columns
  const cardsCols = await queryRunner.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'cards' ORDER BY ordinal_position
  `);
  console.log('cards columns:', cardsCols.map(r => r.column_name));
  
  await queryRunner.release();
  await dataSource.destroy();
  process.exit(0);
}

checkDB().catch(console.error);
