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

  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const photoSetId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  console.log('🌱 Creating photo card set...');

  // Create card set
  const setResult = await client.query(
    `INSERT INTO card_sets (id, name, description, "isPublic", "createdAt", "updatedAt") 
     VALUES ($1, $2, $3, $4, NOW(), NOW()) 
     ON CONFLICT (id) DO UPDATE SET name=$2, description=$3, "isPublic"=$4, "updatedAt"=NOW()
     RETURNING id`,
    [photoSetId, '📸 Фото (Memo)', 'Карточки из ваших фото', true]
  );
  const setId = setResult.rows[0].id;

  // Clear existing cards for this set
  await client.query('DELETE FROM cards WHERE card_set_id = $1', [setId]);

  // Photo files
  const photos = [
    '21051f3254edb75e8ab9d7ddcefefa3dbf1abd76_original.jpeg',
    '7945582142.jpg',
    'acc49be29eb081c269cdb8711630a5c5334089b2_original.jpeg',
  ];

  // Create cards (2 copies of each for pairs)
  let cardIndex = 0;
  for (const photo of photos) {
    const imageUrl = `${appUrl}/uploads/memo/photos/${photo}`;
    console.log(`Creating cards for ${photo}: ${imageUrl}`);

    for (let i = 0; i < 2; i++) {
      await client.query(
        `INSERT INTO cards (card_set_id, image_url, sort_order, "createdAt") 
         VALUES ($1, $2, $3, NOW())`,
        [setId, imageUrl, cardIndex++]
      );
    }
  }

  console.log(`\n✅ Created card set "${setId}" with ${cardIndex} cards (${photos.length} pairs)`);
  console.log(`URL: ${appUrl}/uploads/memo/photos/`);

  await client.end();
  process.exit(0);
}

bootstrap().catch(console.error);
