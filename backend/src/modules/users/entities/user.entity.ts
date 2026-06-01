import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { Address } from './address.entity';
import { LoyaltyTransaction } from './loyalty-transaction.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { OtpCode } from '../../auth/entities/otp-code.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  @Exclude()
  password?: string;

  @Column()
  name: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'loyalty_points', default: 0 })
  loyaltyPoints: number;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id' })
  roleId: number;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => LoyaltyTransaction, (transaction) => transaction.user)
  loyaltyTransactions: LoyaltyTransaction[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => OtpCode, (otp) => otp.user)
  otpCodes: OtpCode[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
