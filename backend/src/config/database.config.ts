import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'pizhams',
  password: process.env.DB_PASSWORD || 'pizhams_password',
  name: process.env.DB_NAME || 'pizhams',
}));
