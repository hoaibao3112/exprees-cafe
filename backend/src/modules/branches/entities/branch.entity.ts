import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'float', nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  lng: number;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'simple-json', name: 'opening_hours', nullable: true })
  openingHours: any;

  @Column({ default: 'ACTIVE' }) // ACTIVE, INACTIVE, BUSY
  status: string;

  @Column({ name: 'is_flagship', default: false })
  isFlagship: boolean;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
