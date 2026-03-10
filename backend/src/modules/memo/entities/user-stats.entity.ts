import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_stats')
export class UserStats {
  @PrimaryColumn()
  userId: string;

  @Column({ name: 'games_played', default: 0 })
  gamesPlayed: number;

  @Column({ name: 'games_won', default: 0 })
  gamesWon: number;

  @Column({ name: 'total_pairs_found', default: 0 })
  totalPairsFound: number;

  @Column({ name: 'total_moves', default: 0 })
  totalMoves: number;

  @Column({ name: 'best_time_single', nullable: true })
  bestTimeSingle: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
