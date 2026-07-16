import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column() // CASH, MOMO, VNPAY
  method: string;

  @Column({ nullable: true })
  gateway: string;

  @Column({ name: 'gateway_txn_id', nullable: true })
  gatewayTxnId: string;

  @Column({ default: 'PENDING' }) // PENDING, COMPLETED, FAILED, REFUNDED
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'simple-json', name: 'gateway_response', nullable: true })
  gatewayResponse: any;

  @Column({ name: 'paid_at', type: 'datetime', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
