import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Banner } from './entities/banner.entity';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Banner])],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [TypeOrmModule, ContentService],
})
export class ContentModule {}
