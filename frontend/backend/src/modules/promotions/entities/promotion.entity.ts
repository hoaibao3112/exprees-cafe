import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Coupon } from './coupon.entity';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'ORDER_DISCOUNT' }) // ORDER_DISCOUNT, FREE_SHIPPING
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'discount_value' })
  discountValue: number;

  @Column({ name: 'discount_type', default: 'FIXED_AMOUNT' }) // PERCENTAGE, FIXED_AMOUNT
  discountType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'min_order_value' })
  minOrderValue: number;

  @Column({ name: 'max_uses', default: 0 }) // 0 means unlimited
  maxUses: number;

  @Column({ name: 'used_count', default: 0 })
  usedCount: number;

  @Column({ name: 'starts_at', type: 'datetime' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'datetime' })
  endsAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Coupon, (coupon) => coupon.promotion)
  coupons: Coupon[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
