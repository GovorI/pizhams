import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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

  // Photo directory - go up one level from backend/src
  const photoDir = path.join(__dirname, '../../photo_for_memo');
  const uploadBaseDir = path.join(__dirname, '../uploads/memo');

  // Ensure upload directory exists
  if (!fs.existsSync(uploadBaseDir)) {
    fs.mkdirSync(uploadBaseDir, { recursive: true });
  }

  console.log('🌱 Seeding memo card sets from local photos...');

  // Clear existing data
  await client.query('TRUNCATE cards, card_sets CASCADE');

  // Get list of images
  const imageFiles = fs
    .readdirSync(photoDir)
    .filter(
      (f) =>
        f.endsWith('.jpg') ||
        f.endsWith('.jpeg') ||
        f.endsWith('.png') ||
        f.endsWith('.webp'),
    );

  console.log(`Found ${imageFiles.length} images`);

  if (imageFiles.length === 0) {
    console.log('No images found in photo_for_memo directory');
    await client.end();
    process.exit(0);
  }

  // Create a card set
  const setResult = await client.query(
    `INSERT INTO card_sets (name, description, "isPublic", "createdAt", "updatedAt") 
     VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id`,
    ['📸 My Cards', 'Custom cards from photos', true],
  );
  const setId = setResult.rows[0].id;

  // Create upload directory for this set
  const setUploadDir = path.join(uploadBaseDir, setId);
  if (!fs.existsSync(setUploadDir)) {
    fs.mkdirSync(setUploadDir, { recursive: true });
  }

  // For each image, create multiple cards (to have pairs)
  let cardIndex = 0;
  for (const imageFile of imageFiles) {
    const sourcePath = path.join(photoDir, imageFile);

    // Copy file to upload directory with new name
    const ext = path.extname(imageFile);
    const newFileName = `card_${cardIndex}${ext}`;
    const destPath = path.join(setUploadDir, newFileName);

    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied ${imageFile} to uploads`);

    // Create URL for the card
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const imageUrl = `${appUrl}/uploads/memo/${setId}/${newFileName}`;

    // Insert card (create 2 copies for a pair)
    for (let i = 0; i < 2; i++) {
      await client.query(
        `INSERT INTO cards (card_set_id, image_url, sort_order, "createdAt") 
         VALUES ($1, $2, $3, NOW())`,
        [setId, imageUrl, cardIndex * 2 + i],
      );
    }

    cardIndex++;
  }

  const totalCards = cardIndex * 2;
  console.log(
    `\n✅ Created card set with ${totalCards} cards (${cardIndex} pairs)`,
  );
  console.log(`Set ID: ${setId}`);
  console.log(`Upload directory: ${setUploadDir}`);

  await client.end();
  process.exit(0);
}

bootstrap().catch(console.error);
