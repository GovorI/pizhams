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
import { GameMove } from './game-move.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CardSet, (cardSet) => cardSet.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_set_id' })
  cardSet: CardSet;

  @Column({ name: 'card_set_id' })
  cardSetId: string;

  @Column({ name: 'image_url', length: 500 })
  imageUrl: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => GameMove, (move) => move.card1)
  movesAsCard1: GameMove[];

  @OneToMany(() => GameMove, (move) => move.card2)
  movesAsCard2: GameMove[];
}
