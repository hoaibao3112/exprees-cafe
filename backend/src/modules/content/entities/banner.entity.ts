import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'link_url', nullable: true })
  linkUrl: string;

  @Column({ default: 'HOME_HERO' }) // HOME_HERO, POPUP
  position: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'starts_at', type: 'datetime', nullable: true })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'datetime', nullable: true })
  endsAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
