import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    // Clean database before each test
    await dataSource.query('DELETE FROM orders');
    await dataSource.query('DELETE FROM products');
    await dataSource.query('DELETE FROM users');
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.query('DELETE FROM users');
    }
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('user');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: '123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'login-test@example.com',
          password: 'password123',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.user.email).toBe('login-test@example.com');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('/api/auth/me (GET)', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create user and get token
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'me-test@example.com',
          password: 'password123',
        });
      authToken = registerResponse.body.access_token;
    });

    it('should return current user with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('me-test@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('/api/auth/logout (POST)', () => {
    let authToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'logout-test@example.com',
          password: 'password123',
        });
      authToken = registerResponse.body.access_token;
    });

    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });
});
