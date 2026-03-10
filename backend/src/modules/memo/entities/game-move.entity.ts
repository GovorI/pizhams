import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { GamePlayer } from './game-player.entity';
import { Card } from './card.entity';

@Entity('game_moves')
export class GameMove {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Game, (game) => game.moves, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @Column({ name: 'game_id' })
  gameId: string;

  @ManyToOne(() => GamePlayer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'player_id' })
  player: GamePlayer;

  @Column({ name: 'player_id', nullable: true })
  playerId: string;

  @ManyToOne(() => Card)
  @JoinColumn({ name: 'card1_id' })
  card1: Card;

  @Column({ name: 'card1_id' })
  card1Id: string;

  @ManyToOne(() => Card)
  @JoinColumn({ name: 'card2_id' })
  card2: Card;

  @Column({ name: 'card2_id' })
  card2Id: string;

  @Column({ default: false })
  isMatch: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
