import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'pizhams',
    password: process.env.DATABASE_PASSWORD || 'pizhams_password',
    database: process.env.DATABASE_NAME || 'pizhams',
  });

  await client.connect();
  console.log('🔌 Connected to database');

  console.log('🌱 Seeding memo card sets...');

  // Clear existing data
  await client.query('TRUNCATE cards, card_sets CASCADE');

  // Create Animals set (16 cards for 4x4 grid)
  const animalsResult = await client.query(
    `INSERT INTO card_sets (name, description, "isPublic", "createdAt", "updatedAt") 
     VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id`,
    ['🐶 Animals', 'Cute animals for kids', true]
  );
  const animalsSetId = animalsResult.rows[0].id;

  const animalImages = [
    'https://cdn-icons-png.flaticon.com/512/616/616408.png',
    'https://cdn-icons-png.flaticon.com/512/616/616430.png',
    'https://cdn-icons-png.flaticon.com/512/616/616412.png',
    'https://cdn-icons-png.flaticon.com/512/616/616418.png',
    'https://cdn-icons-png.flaticon.com/512/616/616424.png',
    'https://cdn-icons-png.flaticon.com/512/616/616446.png',
    'https://cdn-icons-png.flaticon.com/512/616/616450.png',
    'https://cdn-icons-png.flaticon.com/512/616/616408.png',
    'https://cdn-icons-png.flaticon.com/512/616/616430.png',
    'https://cdn-icons-png.flaticon.com/512/616/616412.png',
    'https://cdn-icons-png.flaticon.com/512/616/616418.png',
    'https://cdn-icons-png.flaticon.com/512/616/616424.png',
    'https://cdn-icons-png.flaticon.com/512/616/616446.png',
    'https://cdn-icons-png.flaticon.com/512/616/616450.png',
    'https://cdn-icons-png.flaticon.com/512/616/616408.png',
    'https://cdn-icons-png.flaticon.com/512/616/616430.png',
    'https://cdn-icons-png.flaticon.com/512/616/616412.png',
  ];

  for (let i = 0; i < 16; i++) {
    await client.query(
      `INSERT INTO cards (card_set_id, image_url, sort_order, "createdAt") 
       VALUES ($1, $2, $3, NOW())`,
      [animalsSetId, animalImages[i], i]
    );
  }
  console.log('✅ Created Animals set (16 cards)');

  // Create Vehicles set (8 cards for 4x2 grid)
  const vehiclesResult = await client.query(
    `INSERT INTO card_sets (name, description, "isPublic", "createdAt", "updatedAt") 
     VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id`,
    ['🚗 Vehicles', 'Cars, planes, and more', true]
  );
  const vehiclesSetId = vehiclesResult.rows[0].id;

  const vehicleImages = [
    'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
    'https://cdn-icons-png.flaticon.com/512/3202/3202938.png',
    'https://cdn-icons-png.flaticon.com/512/3202/3202956.png',
    'https://cdn-icons-png.flaticon.com/512/3202/3202968.png',
    'https://cdn-icons-png.flaticon.com/512/3202/3202980.png',
    'https://cdn-icons-png.flaticon.com/512/3202/3202992.png',
    'https://cdn-icons-png.flaticon.com/512/3202/3203004.png',
    'https://cdn-icons-png.flaticon.com/512/3202/3203016.png',
  ];

  for (let i = 0; i < 8; i++) {
    await client.query(
      `INSERT INTO cards (card_set_id, image_url, sort_order, "createdAt") 
       VALUES ($1, $2, $3, NOW())`,
      [vehiclesSetId, vehicleImages[i], i]
    );
  }
  console.log('✅ Created Vehicles set (8 cards)');

  // Create Fruits set (12 cards for 4x3 grid)
  const fruitsResult = await client.query(
    `INSERT INTO card_sets (name, description, "isPublic", "createdAt", "updatedAt") 
     VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id`,
    ['🍎 Fruits', 'Delicious fruits', true]
  );
  const fruitsSetId = fruitsResult.rows[0].id;

  const fruitImages = [
    'https://cdn-icons-png.flaticon.com/512/415/415733.png',
    'https://cdn-icons-png.flaticon.com/512/415/415736.png',
    'https://cdn-icons-png.flaticon.com/512/415/415739.png',
    'https://cdn-icons-png.flaticon.com/512/415/415742.png',
    'https://cdn-icons-png.flaticon.com/512/415/415745.png',
    'https://cdn-icons-png.flaticon.com/512/415/415748.png',
  ];

  for (let i = 0; i < 12; i++) {
    await client.query(
      `INSERT INTO cards (card_set_id, image_url, sort_order, "createdAt") 
       VALUES ($1, $2, $3, NOW())`,
      [fruitsSetId, fruitImages[i % 6], i]
    );
  }
  console.log('✅ Created Fruits set (12 cards)');

  console.log('🎉 Seeding completed!');
  await client.end();
  process.exit(0);
}

bootstrap().catch(console.error);
