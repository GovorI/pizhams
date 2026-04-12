import { Injectable } from '@nestjs/common';
import { MemoRepository } from '../memo.repository';
import { LeaderboardPeriod } from '../dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(private memoRepository: MemoRepository) {}

  async getSinglePlayerLeaderboard(
    period: LeaderboardPeriod = LeaderboardPeriod.ALL,
    limit = 100,
  ) {
    const stats = await this.memoRepository.getLeaderboard(period, limit);

    return stats
      .filter((s) => s.bestTimeSingle !== null)
      .sort((a, b) => {
        // Sort by best time (ascending - lower is better)
        if (a.bestTimeSingle && b.bestTimeSingle) {
          return a.bestTimeSingle - b.bestTimeSingle;
        }
        if (a.bestTimeSingle) return -1;
        if (b.bestTimeSingle) return 1;
        return 0;
      })
      .slice(0, limit)
      .map((stat, index) => ({
        rank: index + 1,
        userId: stat.userId,
        email: stat.userId.slice(0, 8) + '@user',
        bestTime: stat.bestTimeSingle,
        gamesWon: stat.gamesWon,
        gamesPlayed: stat.gamesPlayed,
        totalMoves: stat.totalMoves,
      }));
  }

  async getMultiplayerLeaderboard(
    period: LeaderboardPeriod = LeaderboardPeriod.ALL,
    limit = 100,
  ) {
    const stats = await this.memoRepository.getLeaderboard(period, limit);

    return stats
      .sort((a, b) => {
        // Sort by games won (descending)
        if (b.gamesWon !== a.gamesWon) {
          return b.gamesWon - a.gamesWon;
        }
        // Then by win rate
        const aRate = a.gamesPlayed > 0 ? a.gamesWon / a.gamesPlayed : 0;
        const bRate = b.gamesPlayed > 0 ? b.gamesWon / b.gamesPlayed : 0;
        return bRate - aRate;
      })
      .slice(0, limit)
      .map((stat, index) => ({
        rank: index + 1,
        userId: stat.userId,
        email: stat.userId.slice(0, 8) + '@user',
        gamesWon: stat.gamesWon,
        gamesPlayed: stat.gamesPlayed,
        winRate:
          stat.gamesPlayed > 0
            ? ((stat.gamesWon / stat.gamesPlayed) * 100).toFixed(1)
            : '0',
        totalPairsFound: stat.totalPairsFound,
      }));
  }

  async getUserStats(userId: string) {
    const stats = await this.memoRepository.findUserStats(userId);
    if (!stats) {
      return {
        userId,
        gamesPlayed: 0,
        gamesWon: 0,
        totalPairsFound: 0,
        totalMoves: 0,
        bestTimeSingle: null,
        winRate: '0',
      };
    }

    return {
      userId: stats.userId,
      gamesPlayed: stats.gamesPlayed,
      gamesWon: stats.gamesWon,
      totalPairsFound: stats.totalPairsFound,
      totalMoves: stats.totalMoves,
      bestTimeSingle: stats.bestTimeSingle,
      winRate:
        stats.gamesPlayed > 0
          ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
          : '0',
    };
  }
}
