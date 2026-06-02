import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ type: 'double precision' })
  lat: number;

  @Column({ type: 'double precision' })
  lng: number;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'jsonb', name: 'opening_hours', nullable: true })
  openingHours: any;

  @Column({ default: 'ACTIVE' }) // ACTIVE, INACTIVE, BUSY
  status: string;

  @Column({ name: 'is_flagship', default: false })
  isFlagship: boolean;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
