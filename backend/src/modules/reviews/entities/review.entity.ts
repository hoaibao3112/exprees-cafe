import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Order, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'order_id' })
  order?: Order;

  @Column({ name: 'order_id', nullable: true })
  orderId?: string;

  @Column({ name: 'target_type' }) // PRODUCT, BRANCH
  targetType: string;

  @Column({ name: 'target_id' })
  targetId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ name: 'is_verified_purchase', default: false })
  isVerifiedPurchase: boolean;

  @Column({ default: 'APPROVED' }) // PENDING, APPROVED, SPAM
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
