import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Content (Blogs & Banners)')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get('articles')
  @ApiOperation({ summary: 'Get all published blog articles' })
  getArticles() {
    return this.contentService.findAllArticles();
  }

  @Public()
  @Get('articles/:slug')
  @ApiOperation({ summary: 'Get article details by slug' })
  getArticleBySlug(@Param('slug') slug: string) {
    return this.contentService.findArticleBySlug(slug);
  }

  @Public()
  @Get('banners')
  @ApiOperation({ summary: 'Get active slideshow banners' })
  getBanners() {
    return this.contentService.findAllBanners();
  }

  @Public()
  @Get('videos')
  @ApiOperation({ summary: 'Get active video content' })
  getVideos() {
    return this.contentService.findAllVideos();
  }

  @Post('admin/articles')
  @ApiOperation({ summary: 'Create new article (Admin)' })
  createArticle(
    @Body()
    dto: {
      blogHandle?: string;
      title: string;
      slug: string;
      contentHtml: string;
      authorId: string;
      status?: string;
    },
  ) {
    return this.contentService.createArticle(dto);
  }

  @Post('admin/banners')
  @ApiOperation({ summary: 'Create new banner slide (Admin)' })
  createBanner(
    @Body()
    dto: {
      title: string;
      imageUrl: string;
      linkUrl?: string;
      position?: string;
      sortOrder?: number;
      isActive?: boolean;
      startsAt?: Date;
      endsAt?: Date;
    },
  ) {
    return this.contentService.createBanner(dto);
  }

  @Post('admin/videos')
  @ApiOperation({ summary: 'Create new video (Admin)' })
  createVideo(
    @Body()
    dto: {
      title: string;
      youtubeUrl: string;
      thumbnailUrl: string;
      channelName: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.contentService.createVideo(dto);
  }

  @Patch('admin/videos/:id')
  @ApiOperation({ summary: 'Update video details (Admin)' })
  updateVideo(
    @Param('id') id: string,
    @Body()
    dto: {
      title?: string;
      youtubeUrl?: string;
      thumbnailUrl?: string;
      channelName?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.contentService.updateVideo(id, dto);
  }

  @Delete('admin/videos/:id')
  @ApiOperation({ summary: 'Delete video (Admin)' })
  deleteVideo(@Param('id') id: string) {
    return this.contentService.deleteVideo(id);
  }
}
