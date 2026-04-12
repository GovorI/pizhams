import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { MemoController } from './memo.controller';
import { MemoGateway } from './memo.gateway';
import { MemoRepository } from './memo.repository';
import { CardSetsService } from './services/card-sets.service';
import { GamesService } from './services/games.service';
import { GameMovesService } from './services/game-moves.service';
import { LeaderboardService } from './services/leaderboard.service';
import { MemoFilesService } from './services/files.service';
import { MemoFilesModule } from './files.module';
import { CardSet } from './entities/card-set.entity';
import { Card } from './entities/card.entity';
import { Game } from './entities/game.entity';
import { GamePlayer } from './entities/game-player.entity';
import { GameMove } from './entities/game-move.entity';
import { UserStats } from './entities/user-stats.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MemoFilesModule,
    TypeOrmModule.forFeature([
      CardSet,
      Card,
      Game,
      GamePlayer,
      GameMove,
      UserStats,
    ]),
    JwtModule,
    MulterModule.registerAsync({
      imports: [MemoFilesModule],
      useFactory: (memoFilesService: MemoFilesService) =>
        memoFilesService.getPhotosMulterOptions(),
      inject: [MemoFilesService],
    }),
  ],
  controllers: [MemoController],
  providers: [
    MemoGateway,
    MemoRepository,
    CardSetsService,
    GamesService,
    GameMovesService,
    LeaderboardService,
  ],
  exports: [
    MemoRepository,
    GamesService,
    GameMovesService,
    MemoFilesModule,
  ],
})
export class MemoModule {}
