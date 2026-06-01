import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaFile } from './entities/media-file.entity';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export class MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class MediaService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly storageProvider: string;
  private readonly apiHostUrl: string;

  constructor(
    @InjectRepository(MediaFile)
    private readonly mediaFileRepository: Repository<MediaFile>,
    private readonly configService: ConfigService,
  ) {
    this.storageProvider = this.configService.get<string>('STORAGE_PROVIDER', 'LOCAL');
    this.apiHostUrl = this.configService.get<string>('API_HOST_URL', 'http://localhost:3000');

    // Automatically create uploads directory if using Local Storage
    if (this.storageProvider === 'LOCAL' && !fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveUploadedFile(
    file: MulterFile,
    userId?: string,
  ): Promise<MediaFile> {
    if (!file) {
      throw new BadRequestException('Không tìm thấy tệp tin tải lên');
    }

    const fileExt = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    let cdnUrl = '';

    if (this.storageProvider === 'S3') {
      // Simulate AWS S3 client push
      console.log(`[S3 Storage] Uploading ${file.originalname} to bucket 'express-cafe-assets'...`);
      console.log(`[S3 Storage] Saved with key: uploads/${uniqueFilename}`);
      cdnUrl = `https://cdn.expresscafe.vn/uploads/${uniqueFilename}`;
    } else {
      // Local Storage
      const destinationPath = path.join(this.uploadDir, uniqueFilename);
      fs.writeFileSync(destinationPath, file.buffer);
      cdnUrl = `${this.apiHostUrl}/uploads/${uniqueFilename}`;
    }

    const mediaFile = this.mediaFileRepository.create({
      uploadedBy: userId,
      originalName: file.originalname,
      fileKey: uniqueFilename,
      cdnUrl,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    });

    return this.mediaFileRepository.save(mediaFile);
  }
}
