import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { MemoRepository } from '../memo.repository';
import { MakeMoveDto } from '../dto/make-move.dto';
import { GameStatus, GameMode } from '../entities/game.entity';

export interface MoveResult {
  isMatch: boolean;
  gameStatus: GameStatus;
  playerId: string;
  nextPlayerId?: string;
  scores: { playerId: string; score: number }[];
}

@Injectable()
export class GameMovesService {
  constructor(private memoRepository: MemoRepository) {}

  async makeMove(gameId: string, gamePlayerId: string, dto: MakeMoveDto): Promise<MoveResult> {
    const game = await this.memoRepository.findGameById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status !== GameStatus.PLAYING) {
      throw new BadRequestException('Game is not in progress');
    }

    const gamePlayer = await this.memoRepository['gamePlayerRepository'].findOne({ where: { id: gamePlayerId } });
    if (!gamePlayer) {
      throw new NotFoundException('Player not found');
    }

    // Check if it's player's turn (currentPlayerId stores userId)
    if (game.currentPlayerId !== gamePlayer.userId) {
      throw new ForbiddenException('Not your turn');
    }

    // Get cards to check if they match
    const card1 = await this.memoRepository['cardRepository'].findOne({ where: { id: dto.card1Id } });
    const card2 = await this.memoRepository['cardRepository'].findOne({ where: { id: dto.card2Id } });

    if (!card1 || !card2) {
      throw new NotFoundException('Card not found');
    }

    if (card1.cardSetId !== card2.cardSetId) {
      throw new BadRequestException('Cards must be from the same set');
    }

    // Check if cards match (same image URL means they're a pair)
    // In a real implementation, cards would have a pairId or similar
    const isMatch = card1.imageUrl === card2.imageUrl && card1.id !== card2.id;

    // Record the move
    await this.memoRepository.createGameMove({
      gameId,
      playerId: gamePlayer.id,
      card1Id: dto.card1Id,
      card2Id: dto.card2Id,
      isMatch,
    });

    // Update player stats
    gamePlayer.moves += 1;
    if (isMatch) {
      gamePlayer.score += 1;
    }
    await this.memoRepository.updateGamePlayer(gamePlayer.id, gamePlayer);

    // Calculate scores for all players
    const players = await this.memoRepository.findGamePlayers(gameId);
    const scores = players.map((p) => ({
      playerId: p.id,
      score: p.score,
    }));

    let nextPlayerId: string | undefined;

    // If not a match, switch to next player
    if (!isMatch) {
      const currentPlayerIndex = players.findIndex((p) => p.id === gamePlayer.id);
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      nextPlayerId = players[nextIndex].userId;
      game.currentPlayerId = nextPlayerId;
    }
    // If match, player keeps the turn (currentPlayerId stays the same)

    // Check if game is finished (all pairs found)
    const totalPairs = (game.gridRows * game.gridCols) / 2;
    const maxScore = Math.max(...players.map((p) => p.score));

    if (maxScore >= totalPairs) {
      game.status = GameStatus.FINISHED;
      game.finishedAt = new Date();

      // Find winner (player with most pairs)
      const winner = players.reduce((prev, current) =>
        current.score > prev.score ? current : prev,
      );
      game.winnerId = winner.userId;

      // Calculate time spent
      const timeSpent = game.startedAt 
        ? Math.floor((game.finishedAt.getTime() - game.startedAt.getTime()) / 1000)
        : 0;

      // Update user stats for all players
      for (const player of players) {
        const isSinglePlayer = game.mode === GameMode.SINGLE;
        await this.updateUserStats(player.userId, {
          gamesPlayed: 1,
          gamesWon: player.userId === winner.userId ? 1 : 0,
          totalPairsFound: player.score,
          totalMoves: player.moves,
          timeSpent: timeSpent,
          isSinglePlayer: isSinglePlayer,
        });
      }
    }

    await this.memoRepository.updateGame(gameId, game);

    return {
      isMatch,
      gameStatus: game.status,
      playerId: gamePlayer.id,
      nextPlayerId,
      scores,
    };
  }

  private async updateUserStats(
    userId: string,
    delta: { 
      gamesPlayed: number; 
      gamesWon: number; 
      totalPairsFound: number; 
      totalMoves: number;
      timeSpent?: number;
      isSinglePlayer?: boolean;
    },
  ) {
    const stats = await this.memoRepository.findOrCreateUserStats(userId);

    const updateData: any = {
      gamesPlayed: stats.gamesPlayed + delta.gamesPlayed,
      gamesWon: stats.gamesWon + delta.gamesWon,
      totalPairsFound: stats.totalPairsFound + delta.totalPairsFound,
      totalMoves: stats.totalMoves + delta.totalMoves,
    };

    // Update best time for single player games
    if (delta.isSinglePlayer && delta.timeSpent && delta.timeSpent > 0) {
      if (!stats.bestTimeSingle || delta.timeSpent < stats.bestTimeSingle) {
        updateData.bestTimeSingle = delta.timeSpent;
      }
    }

    await this.memoRepository.updateUserStats(userId, updateData);
  }

  async getGameMoves(gameId: string) {
    return this.memoRepository.findGameMoves(gameId);
  }
}
