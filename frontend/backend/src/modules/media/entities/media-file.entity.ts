import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('media_files')
export class MediaFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploader?: User;

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy?: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'file_key' }) // Saved local filename or S3 key
  fileKey: string;

  @Column({ name: 'cdn_url' }) // Full URL to access this asset
  cdnUrl: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'int' })
  sizeBytes: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
