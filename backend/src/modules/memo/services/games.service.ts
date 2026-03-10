import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { MemoRepository } from '../memo.repository';
import { CreateGameDto, GridSize } from '../dto/create-game.dto';
import { GameMode, GameStatus } from '../entities/game.entity';

@Injectable()
export class GamesService {
  constructor(private memoRepository: MemoRepository) {}

  private gridSizeMap: Record<GridSize, { rows: number; cols: number }> = {
    [GridSize.SMALL]: { rows: 3, cols: 2 },    // 6 cards
    [GridSize.MEDIUM]: { rows: 4, cols: 3 },   // 12 cards
    [GridSize.LARGE]: { rows: 4, cols: 4 },    // 16 cards
    [GridSize.XLARGE]: { rows: 6, cols: 4 },   // 24 cards
    [GridSize.XXLARGE]: { rows: 8, cols: 4 },  // 32 cards
  };

  async createGame(dto: CreateGameDto, userId: string) {
    const cardSet = await this.memoRepository.findCardSetById(dto.cardSetId, true);
    if (!cardSet) {
      throw new NotFoundException('Card set not found');
    }

    // Determine grid size
    let gridRows = dto.gridRows;
    let gridCols = dto.gridCols;

    if (dto.gridSize) {
      const size = this.gridSizeMap[dto.gridSize];
      gridRows = size.rows;
      gridCols = size.cols;
    }

    if (!gridRows || !gridCols) {
      gridRows = 4;
      gridCols = 3;
    }

    const totalCards = gridRows * gridCols;
    const pairsNeeded = totalCards / 2;

    if (cardSet.cards.length < pairsNeeded) {
      throw new BadRequestException(
        `Card set must have at least ${pairsNeeded} cards for this grid size. Current: ${cardSet.cards.length}`,
      );
    }

    // Create game
    const game = await this.memoRepository.createGame({
      cardSetId: dto.cardSetId,
      mode: dto.mode,
      gridRows,
      gridCols,
      status: GameStatus.WAITING,
    });

    // Add creator as first player
    await this.memoRepository.createGamePlayer({
      gameId: game.id,
      userId,
      score: 0,
      moves: 0,
      timeSpent: 0,
    });

    return this.memoRepository.findGameById(game.id);
  }

  async findOne(id: string) {
    const game = await this.memoRepository.findGameById(id);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  async startGame(gameId: string, userId: string) {
    const game = await this.memoRepository.findGameById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const players = await this.memoRepository.findGamePlayers(gameId);
    if (players.length === 0) {
      throw new BadRequestException('Game must have at least one player');
    }

    // For single player, set current player to the only player
    if (game.mode === GameMode.SINGLE) {
      game.currentPlayerId = players[0].userId;
    } else {
      // For multiplayer, first player starts
      game.currentPlayerId = players[0].userId;
    }

    game.status = GameStatus.PLAYING;
    game.startedAt = new Date();

    return this.memoRepository.updateGame(gameId, game);
  }

  async joinGame(gameId: string, userId: string) {
    const game = await this.memoRepository.findGameById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException('Game has already started');
    }

    // Check if already joined
    const existingPlayer = await this.memoRepository.findGamePlayer(gameId, userId);
    if (existingPlayer) {
      return game;
    }

    // For single player mode, don't allow joining
    if (game.mode === GameMode.SINGLE) {
      throw new BadRequestException('Cannot join a single player game');
    }

    // Max 6 players
    const players = await this.memoRepository.findGamePlayers(gameId);
    if (players.length >= 6) {
      throw new BadRequestException('Game is full (max 6 players)');
    }

    await this.memoRepository.createGamePlayer({
      gameId,
      userId,
      score: 0,
      moves: 0,
      timeSpent: 0,
    });

    return this.memoRepository.findGameById(gameId);
  }

  async leaveGame(gameId: string, userId: string) {
    const game = await this.memoRepository.findGameById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const player = await this.memoRepository.findGamePlayer(gameId, userId);
    if (!player) {
      throw new NotFoundException('Player not found in this game');
    }

    // If game hasn't started, just remove player
    // If game has started, mark as finished for this player
    // For simplicity, we'll just remove the player
    await this.memoRepository['gamePlayerRepository'].delete({ id: player.id });

    // If no players left, delete the game
    const remainingPlayers = await this.memoRepository.findGamePlayers(gameId);
    if (remainingPlayers.length === 0) {
      await this.memoRepository['gameRepository'].delete(gameId);
      return null;
    }

    return this.memoRepository.findGameById(gameId);
  }

  async findUserGames(userId: string, status?: string, limit = 20) {
    return this.memoRepository.findUserGames(userId, status, limit);
  }

  async getGameMoves(gameId: string) {
    return this.memoRepository.findGameMoves(gameId);
  }
}
