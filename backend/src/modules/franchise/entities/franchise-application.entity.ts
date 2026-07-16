import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FranchisePackage } from './franchise-package.entity';
import { User } from '../../users/entities/user.entity';

@Entity('franchise_applications')
export class FranchiseApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => FranchisePackage, (pkg) => pkg.applications, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'package_id' })
  package: FranchisePackage;

  @Column({ name: 'package_id' })
  packageId: string;

  @Column({ name: 'applicant_name' })
  applicantName: string;

  @Column()
  phone: string;

  @Column()
  province: string;

  @Column({ default: 'PENDING' }) // PENDING, REVIEWING, APPROVED, REJECTED
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
