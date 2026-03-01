import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
}));
