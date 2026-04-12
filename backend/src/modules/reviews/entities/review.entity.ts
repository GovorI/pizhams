import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ name: 'admin_response', type: 'text', nullable: true })
  adminResponse: string;

  @Column({ name: 'admin_response_date', nullable: true })
  adminResponseDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
