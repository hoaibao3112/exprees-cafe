import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { Video } from './entities/video.entity';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Banner, Video])],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [TypeOrmModule, ContentService],
})
export class ContentModule {}
