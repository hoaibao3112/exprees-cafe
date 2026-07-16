import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ name: 'recipient_name' })
  recipientName: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column()
  street: string;

  @Column()
  ward: string;

  @Column()
  district: string;

  @Column()
  city: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;
}
