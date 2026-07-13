import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Promotion } from './promotion.entity';
import { User } from '../../users/entities/user.entity';
import { CouponUsage } from './coupon-usage.entity';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Promotion, (promotion) => promotion.coupons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotion_id' })
  promotion: Promotion;

  @Column({ name: 'promotion_id' })
  promotionId: string;

  @Column({ unique: true })
  code: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({ name: 'max_uses', default: 1 })
  maxUses: number;

  @Column({ name: 'used_count', default: 0 })
  usedCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt?: Date;

  @OneToMany(() => CouponUsage, (usage) => usage.coupon)
  usages: CouponUsage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
