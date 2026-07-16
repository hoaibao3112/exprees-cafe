import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService, MulterFile } from './media.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Media & Uploads')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image file (Max 10MB - Local or S3)' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/svg+xml',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Định dạng tệp không hỗ trợ. Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF, SVG.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadFile(
    @UploadedFile() file: MulterFile,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng cung cấp tệp tin ảnh để upload');
    }
    return this.mediaService.saveUploadedFile(file, userId);
  }
}
