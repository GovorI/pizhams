import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CardSet } from './card-set.entity';
import { User } from '../../users/entities/user.entity';
import { GamePlayer } from './game-player.entity';
import { GameMove } from './game-move.entity';

export enum GameMode {
  SINGLE = 'single',
  MULTIPLAYER = 'multiplayer',
}

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CardSet, (cardSet) => cardSet.games)
  @JoinColumn({ name: 'card_set_id' })
  cardSet: CardSet;

  @Column({ name: 'card_set_id' })
  cardSetId: string;

  @Column({ type: 'enum', enum: GameMode })
  mode: GameMode;

  @Column({ name: 'grid_rows' })
  gridRows: number;

  @Column({ name: 'grid_cols' })
  gridCols: number;

  @Column({ type: 'enum', enum: GameStatus, default: GameStatus.WAITING })
  status: GameStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'current_player_id' })
  currentPlayer: User;

  @Column({ name: 'current_player_id', nullable: true })
  currentPlayerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'winner_id' })
  winner: User;

  @Column({ name: 'winner_id', nullable: true })
  winnerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ name: 'finished_at', type: 'timestamp', nullable: true })
  finishedAt: Date;

  @OneToMany(() => GamePlayer, (gamePlayer) => gamePlayer.game, {
    cascade: true,
  })
  players: GamePlayer[];

  @OneToMany(() => GameMove, (gameMove) => gameMove.game)
  moves: GameMove[];
}
