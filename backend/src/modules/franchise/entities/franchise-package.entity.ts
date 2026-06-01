import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { FranchiseApplication } from './franchise-application.entity';

@Entity('franchise_packages')
export class FranchisePackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'model_type', default: 'EXPRESS' }) // KIOSK, EXPRESS, PREMIUM
  modelType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'investment_from' })
  investmentFrom: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => FranchiseApplication, (app) => app.package)
  applications: FranchiseApplication[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
