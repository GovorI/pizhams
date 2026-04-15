import { Injectable } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { CardSet } from './entities/card-set.entity';
import { Card } from './entities/card.entity';
import { Game, GameMode, GameStatus } from './entities/game.entity';
import { GamePlayer } from './entities/game-player.entity';
import { GameMove } from './entities/game-move.entity';
import { UserStats } from './entities/user-stats.entity';

@Injectable()
export class MemoRepository {
  private cardSetRepository: Repository<CardSet>;
  private cardRepository: Repository<Card>;
  private gameRepository: Repository<Game>;
  private gamePlayerRepository: Repository<GamePlayer>;
  private gameMoveRepository: Repository<GameMove>;
  private userStatsRepository: Repository<UserStats>;

  constructor(private dataSource: DataSource) {
    this.cardSetRepository = this.dataSource.getRepository(CardSet);
    this.cardRepository = this.dataSource.getRepository(Card);
    this.gameRepository = this.dataSource.getRepository(Game);
    this.gamePlayerRepository = this.dataSource.getRepository(GamePlayer);
    this.gameMoveRepository = this.dataSource.getRepository(GameMove);
    this.userStatsRepository = this.dataSource.getRepository(UserStats);
  }

  // CardSet methods
  async createCardSet(data: Partial<CardSet>): Promise<CardSet> {
    const cardSet = this.cardSetRepository.create(data);
    return this.cardSetRepository.save(cardSet);
  }

  async findCardSetById(
    id: string,
    includeCards = false,
  ): Promise<CardSet | null> {
    const query = this.cardSetRepository
      .createQueryBuilder('cardSet')
      .leftJoinAndSelect('cardSet.owner', 'owner')
      .where('cardSet.id = :id', { id });

    if (includeCards) {
      query
        .leftJoinAndSelect('cardSet.cards', 'cards')
        .orderBy('cards.sortOrder', 'ASC');
    }

    return query.getOne();
  }

  async findPublicCardSets(limit = 20): Promise<CardSet[]> {
    return this.cardSetRepository
      .createQueryBuilder('cardSet')
      .leftJoinAndSelect('cardSet.owner', 'owner')
      .where('cardSet.isPublic = :isPublic', { isPublic: true })
      .leftJoin('cardSet.cards', 'cards')
      .addSelect('COUNT(cards.id)', 'cardsCount')
      .groupBy('cardSet.id')
      .addGroupBy('owner.id')
      .orderBy('cardSet.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findUserCardSets(userId: string): Promise<CardSet[]> {
    return this.cardSetRepository
      .createQueryBuilder('cardSet')
      .leftJoinAndSelect('cardSet.cards', 'cards')
      .where('cardSet.ownerId = :userId', { userId })
      .orderBy('cardSet.createdAt', 'DESC')
      .getMany();
  }

  async updateCardSet(
    id: string,
    data: Partial<CardSet>,
  ): Promise<CardSet | null> {
    await this.cardSetRepository.update(id, data);
    return this.findCardSetById(id);
  }

  async deleteCardSet(id: string): Promise<void> {
    // Delete game moves for games using this card set
    const games = await this.gameRepository.find({ where: { cardSetId: id } });
    if (games.length > 0) {
      const gameIds = games.map((g) => g.id);
      await this.gameMoveRepository.delete({ gameId: In(gameIds) });
      await this.gamePlayerRepository.delete({ gameId: In(gameIds) });
      await this.gameRepository.delete({ cardSetId: id });
    }

    // Cards will be cascaded by TypeORM (cascade: true on CardSet.cards)
    await this.cardSetRepository.delete(id);
  }

  // Card methods
  async createCard(data: Partial<Card>): Promise<Card> {
    const card = this.cardRepository.create(data);
    return this.cardRepository.save(card);
  }

  async updateCard(id: string, data: Partial<Card>): Promise<Card | null> {
    await this.cardRepository.update(id, data);
    return this.cardRepository.findOne({ where: { id } });
  }

  async deleteCard(id: string): Promise<void> {
    await this.cardRepository.delete(id);
  }

  async findCardsBySetId(cardSetId: string): Promise<Card[]> {
    return this.cardRepository
      .createQueryBuilder('card')
      .where('card.cardSetId = :cardSetId', { cardSetId })
      .orderBy('card.sortOrder', 'ASC')
      .getMany();
  }

  // Game methods
  async createGame(data: Partial<Game>): Promise<Game> {
    const game = this.gameRepository.create(data);
    return this.gameRepository.save(game);
  }

  async findGameById(id: string): Promise<Game | null> {
    return this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.cardSet', 'cardSet')
      .leftJoinAndSelect('cardSet.cards', 'cards')
      .leftJoinAndSelect('game.players', 'players')
      .leftJoinAndSelect('players.user', 'user')
      .leftJoinAndSelect('game.currentPlayer', 'currentPlayer')
      .leftJoinAndSelect('game.winner', 'winner')
      .where('game.id = :id', { id })
      .orderBy('cards.sortOrder', 'ASC')
      .getOne();
  }

  async updateGame(id: string, data: Partial<Game>): Promise<Game | null> {
    // Extract only simple fields for update
    const updateData: any = {
      status: data.status,
      gridRows: data.gridRows,
      gridCols: data.gridCols,
      currentPlayerId: data.currentPlayerId,
      winnerId: data.winnerId,
      startedAt: data.startedAt,
      finishedAt: data.finishedAt,
    };

    await this.gameRepository.update(id, updateData);
    return this.findGameById(id);
  }

  async findWaitingMultiplayerGames(
    cardSetId?: string,
    limit = 20,
  ): Promise<Game[]> {
    const query = this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.cardSet', 'cardSet')
      .leftJoinAndSelect('game.players', 'players')
      .leftJoinAndSelect('players.user', 'user')
      .where('game.status = :status', { status: GameStatus.WAITING })
      .andWhere('game.mode = :mode', { mode: GameMode.MULTIPLAYER })
      .andWhere('game.gridRows * game.gridCols <= (SELECT COUNT(*) FROM cards WHERE cardSetId = game.cardSetId) * 2')
      .orderBy('game.createdAt', 'DESC')
      .limit(limit);

    if (cardSetId) {
      query.andWhere('game.cardSetId = :cardSetId', { cardSetId });
    }

    return query.getMany();
  }

  async findUserGames(
    userId: string,
    status?: string,
    limit = 20,
  ): Promise<Game[]> {
    const query = this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.cardSet', 'cardSet')
      .leftJoinAndSelect('game.players', 'players')
      .leftJoinAndSelect('players.user', 'user')
      .leftJoinAndSelect('game.winner', 'winner')
      .innerJoin('game.players', 'player')
      .where('player.userId = :userId', { userId })
      .orderBy('game.createdAt', 'DESC')
      .limit(limit);

    if (status) {
      query.andWhere('game.status = :status', { status });
    }

    return query.getMany();
  }

  // GamePlayer methods
  async createGamePlayer(data: Partial<GamePlayer>): Promise<GamePlayer> {
    const player = this.gamePlayerRepository.create(data);
    return this.gamePlayerRepository.save(player);
  }

  async findGamePlayer(
    gameId: string,
    userId: string,
  ): Promise<GamePlayer | null> {
    return this.gamePlayerRepository.findOne({
      where: { gameId, userId },
      relations: ['user'],
    });
  }

  async updateGamePlayer(
    id: string,
    data: Partial<GamePlayer>,
  ): Promise<GamePlayer | null> {
    await this.gamePlayerRepository.update(id, data);
    return this.gamePlayerRepository.findOne({ where: { id } });
  }

  async findGamePlayers(gameId: string): Promise<GamePlayer[]> {
    return this.gamePlayerRepository
      .createQueryBuilder('gamePlayer')
      .leftJoinAndSelect('gamePlayer.user', 'user')
      .where('gamePlayer.gameId = :gameId', { gameId })
      .getMany();
  }

  // GameMove methods
  async createGameMove(data: Partial<GameMove>): Promise<GameMove> {
    const move = this.gameMoveRepository.create(data);
    return this.gameMoveRepository.save(move);
  }

  async findGameMoves(gameId: string): Promise<GameMove[]> {
    return this.gameMoveRepository
      .createQueryBuilder('gameMove')
      .leftJoinAndSelect('gameMove.card1', 'card1')
      .leftJoinAndSelect('gameMove.card2', 'card2')
      .where('gameMove.gameId = :gameId', { gameId })
      .orderBy('gameMove.createdAt', 'ASC')
      .getMany();
  }

  // UserStats methods
  async findOrCreateUserStats(userId: string): Promise<UserStats> {
    let stats = await this.userStatsRepository.findOne({ where: { userId } });
    if (!stats) {
      stats = this.userStatsRepository.create({ userId });
      stats = await this.userStatsRepository.save(stats);
    }
    return stats;
  }

  async updateUserStats(
    userId: string,
    data: Partial<UserStats>,
  ): Promise<UserStats | null> {
    await this.userStatsRepository.upsert({ userId, ...data }, ['userId']);
    return this.userStatsRepository.findOne({ where: { userId } });
  }

  async findUserStats(userId: string): Promise<UserStats | null> {
    return this.userStatsRepository.findOne({ where: { userId } });
  }

  async getLeaderboard(
    period: string = 'all',
    limit = 100,
  ): Promise<UserStats[]> {
    const query = this.userStatsRepository
      .createQueryBuilder('stats')
      .orderBy('stats.gamesWon', 'DESC')
      .addOrderBy('stats.bestTimeSingle', 'ASC', 'NULLS LAST')
      .limit(limit);

    // Для периодов можно добавить фильтрацию по updatedAt
    if (period !== 'all') {
      const dateFilter = this.getDateFilter(period);
      query.andWhere('stats.updatedAt >= :date', { date: dateFilter });
    }

    return query.getMany();
  }

  private getDateFilter(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.setDate(now.getDate() - 1));
      case 'weekly':
        return new Date(now.setDate(now.getDate() - 7));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() - 1));
      default:
        return new Date(0);
    }
  }
}
