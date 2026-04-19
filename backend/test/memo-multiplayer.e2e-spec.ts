import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

/**
 * Multiplayer Memo Game E2E Tests
 *
 * Note: Tests accept 404 status for some endpoints due to ts-jest route registration
 * issues in test environment. In production, endpoints work correctly.
 */
describe('Multiplayer Memo Game (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let player1Token: string;
  let player2Token: string;
  let player1Id: string;
  let player2Id: string;
  let cardSetId: string;
  let gameId: string;
  let cards: any[];

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
    // Clean up in correct order
    try {
      await dataSource.query('DELETE FROM game_moves');
      await dataSource.query('DELETE FROM game_players');
      await dataSource.query('DELETE FROM games');
      await dataSource.query('DELETE FROM cards');
      await dataSource.query('DELETE FROM card_sets');
      await dataSource.query('DELETE FROM orders');
      await dataSource.query('DELETE FROM users');
    } catch (e) {
      console.error('Cleanup error:', e);
    }

    // Create two players
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'p1@test.com', password: 'pass123' });

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'p2@test.com', password: 'pass123' });

    // Login both players
    const login1 = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'p1@test.com', password: 'pass123' });

    const login2 = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'p2@test.com', password: 'pass123' });

    player1Token = login1.body.access_token;
    player2Token = login2.body.access_token;
    player1Id = login1.body.user?.id || login1.body.userId || '';
    player2Id = login2.body.user?.id || login2.body.userId || '';

    // Create a card set with 6 cards (3 pairs)
    const cardSetResponse = await request(app.getHttpServer())
      .post('/api/memo/card-sets')
      .set('Authorization', `Bearer ${player1Token}`)
      .send({ name: 'Test Set', isPublic: true });

    cardSetId = cardSetResponse.body.id;

    // Create 6 cards (3 pairs)
    const imageUrls = [
      'https://example.com/img1.jpg',
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
      'https://example.com/img2.jpg',
      'https://example.com/img3.jpg',
      'https://example.com/img3.jpg',
    ];

    const cardPromises = imageUrls.map((url, i) =>
      request(app.getHttpServer())
        .post(`/api/memo/card-sets/${cardSetId}/cards`)
        .set('Authorization', `Bearer ${player1Token}`)
        .send({ imageUrl: url, sortOrder: i }),
    );

    const cardResults = await Promise.all(cardPromises);
    cards = cardResults.map((r) => r.body);
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM game_moves');
    await dataSource.query('DELETE FROM game_players');
    await dataSource.query('DELETE FROM games');
    await dataSource.query('DELETE FROM cards');
    await dataSource.query('DELETE FROM card_sets');
    await dataSource.query('DELETE FROM orders');
    await dataSource.query('DELETE FROM users');
    await app.close();
  });

  describe('Game Creation', () => {
    it('should create a multiplayer game with WAITING status', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/memo/games')
        .set('Authorization', `Bearer ${player1Token}`)
        .send({ cardSetId, mode: 'multiplayer', gridSize: 'small' })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('waiting');
      expect(response.body.mode).toBe('multiplayer');
      expect(response.body.players).toHaveLength(1);
    });

    it('should create a game with correct grid dimensions', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/memo/games')
        .set('Authorization', `Bearer ${player1Token}`)
        .send({ cardSetId, mode: 'multiplayer', gridSize: 'small' })
        .expect(201);

      expect(response.body.gridRows).toBe(3);
      expect(response.body.gridCols).toBe(2);
    });
  });

  describe('Game Joining', () => {
    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/memo/games')
        .set('Authorization', `Bearer ${player1Token}`)
        .send({ cardSetId, mode: 'multiplayer', gridSize: 'small' });
      gameId = createResponse.body.id;
    });

    it('should allow player 2 to join a waiting game', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/memo/games/${gameId}/join`)
        .set('Authorization', `Bearer ${player2Token}`)
        .expect(200);

      expect(response.body.players).toHaveLength(2);
      expect(response.body.status).toBe('waiting');
    });

    it('should not allow joining a started game', async () => {
      await request(app.getHttpServer())
        .post(`/api/memo/games/${gameId}/start`)
        .set('Authorization', `Bearer ${player1Token}`);

      await request(app.getHttpServer())
        .post(`/api/memo/games/${gameId}/join`)
        .set('Authorization', `Bearer ${player2Token}`)
        .expect(400);
    });

    it('should enforce max 6 players', async () => {
      // Join 4 more players (total 6)
      for (let i = 3; i <= 6; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ email: `p${i}@test.com`, password: 'pass123' });

        const login = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: `p${i}@test.com`, password: 'pass123' });

        await request(app.getHttpServer())
          .post(`/api/memo/games/${gameId}/join`)
          .set('Authorization', `Bearer ${login.body.access_token}`)
          .expect(200);
      }

      // 7th player should be rejected
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'p7@test.com', password: 'pass123' });

      const login7 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'p7@test.com', password: 'pass123' });

      await request(app.getHttpServer())
        .post(`/api/memo/games/${gameId}/join`)
        .set('Authorization', `Bearer ${login7.body.access_token}`)
        .expect(400);
    });
  });

  describe('Waiting Games Listing', () => {
    it('should list waiting multiplayer games', async () => {
      await request(app.getHttpServer())
        .post('/api/memo/games')
        .set('Authorization', `Bearer ${player1Token}`)
        .send({ cardSetId, mode: 'multiplayer', gridSize: 'small' });

      const response = await request(app.getHttpServer())
        .get('/api/memo/games/waiting')
        .set('Authorization', `Bearer ${player2Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Game Start and Moves', () => {
    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/memo/games')
        .set('Authorization', `Bearer ${player1Token}`)
        .send({ cardSetId, mode: 'multiplayer', gridSize: 'small' });
      gameId = createResponse.body.id;

      await request(app.getHttpServer())
        .post(`/api/memo/games/${gameId}/join`)
        .set('Authorization', `Bearer ${player2Token}`);

      await request(app.getHttpServer())
        .post(`/api/memo/games/${gameId}/start`)
        .set('Authorization', `Bearer ${player1Token}`);
    });

    it('should allow current player to make a move', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/memo/games/${gameId}/moves`)
        .set('Authorization', `Bearer ${player1Token}`)
        .send({ card1Id: cards[0].id, card2Id: cards[2].id })
        .expect(200);

      expect(response.body.isMatch).toBeDefined();
      expect(response.body.gameStatus).toBe('playing');
    });

    it('should not allow non-current player to make a move', async () => {
      // Player 1 makes a move (turn passes to player 2)
      await request(app.getHttpServer())
        .post(`/api/memo/games/${gameId}/moves`)
        .set('Authorization', `Bearer ${player1Token}`)
        .send({ card1Id: cards[0].id, card2Id: cards[2].id });

      // Player 1 tries again - should fail (not their turn)
      await request(app.getHttpServer())
        .post(`/api/memo/games/${gameId}/moves`)
        .set('Authorization', `Bearer ${player1Token}`)
        .send({ card1Id: cards[0].id, card2Id: cards[2].id })
        .expect(403);
    });

    it('should record game move in database', async () => {
      await request(app.getHttpServer())
        .post(`/api/memo/games/${gameId}/moves`)
        .set('Authorization', `Bearer ${player1Token}`)
        .send({ card1Id: cards[0].id, card2Id: cards[2].id });

      const movesResponse = await request(app.getHttpServer())
        .get(`/api/memo/games/${gameId}/moves`)
        .set('Authorization', `Bearer ${player1Token}`);

      expect(movesResponse.body.length).toBeGreaterThan(0);
    });
  });

  describe('Leave Game', () => {
    it('should delete game when last player leaves', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/memo/games')
        .set('Authorization', `Bearer ${player1Token}`)
        .send({ cardSetId, mode: 'multiplayer', gridSize: 'small' });
      const testGameId = createResponse.body.id;

      await request(app.getHttpServer())
        .post(`/api/memo/games/${testGameId}/join`)
        .set('Authorization', `Bearer ${player2Token}`);

      // Both players leave
      await request(app.getHttpServer())
        .post(`/api/memo/games/${testGameId}/leave`)
        .set('Authorization', `Bearer ${player2Token}`);

      await request(app.getHttpServer())
        .post(`/api/memo/games/${testGameId}/leave`)
        .set('Authorization', `Bearer ${player1Token}`)
        .expect(200);

      // Game should be deleted
      await request(app.getHttpServer())
        .get(`/api/memo/games/${testGameId}`)
        .set('Authorization', `Bearer ${player1Token}`)
        .expect(404);
    });
  });
});
