import { Injectable, OnApplicationBootstrap, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { Banner } from './entities/banner.entity';
import { Video } from './entities/video.entity';

@Injectable()
export class ContentService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  async onApplicationBootstrap() {
    // Seed initial banners
    const bannerCount = await this.bannerRepository.count();
    if (bannerCount === 0) {
      console.log('🌱 Seeding initial banners...');
      const seedBanners = [
        {
          title: 'Khởi đầu ngày mới tỉnh thức cùng Express Cafe',
          imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=1200&auto=format&fit=crop',
          linkUrl: '/promotions',
          position: 'HOME_HERO',
          sortOrder: 1,
          isActive: true,
        },
        {
          title: 'Signature Cold Brew - Đậm đà hương vị ủ chậm 24h',
          imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=1200&auto=format&fit=crop',
          linkUrl: '/branches',
          position: 'HOME_HERO',
          sortOrder: 2,
          isActive: true,
        },
      ];
      await this.bannerRepository.save(this.bannerRepository.create(seedBanners));
      console.log('🌱 Successfully seeded 2 home banners!');
    }

    // Seed initial videos
    console.log('🌱 Checking / Seeding videos...');
    const videoCount = await this.videoRepository.count();
    if (videoCount === 0) {
      const seedVideos = [
        {
          title: 'Giải mã bí quyết chốt đơn của Express Cafe',
          youtubeUrl: 'https://www.youtube.com/watch?v=F3P_S8Z2D7k',
          thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
          channelName: 'EXPRESS CAFE OFFICIAL',
          sortOrder: 1,
          isActive: true,
          publishedAt: new Date(),
        },
        {
          title: 'Quy trình vận hành xe cà phê nhượng quyền tinh gọn',
          youtubeUrl: 'https://www.youtube.com/watch?v=d_2e7Z2N7pA',
          thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
          channelName: 'EXPRESS CAFE OFFICIAL',
          sortOrder: 2,
          isActive: true,
          publishedAt: new Date(),
        },
        {
          title: 'Express Cafe Profile - Version 2025',
          youtubeUrl: 'https://www.youtube.com/watch?v=H74rBfGkMoc',
          thumbnailUrl: '/media__1780386740323.png',
          channelName: 'EXPRESS CAFE OFFICIAL',
          sortOrder: 3,
          isActive: true,
          publishedAt: new Date(),
        },
      ];

      for (const seed of seedVideos) {
        const existing = await this.videoRepository.findOne({ where: { title: seed.title } });
        if (existing) {
          existing.thumbnailUrl = seed.thumbnailUrl;
          existing.youtubeUrl = seed.youtubeUrl;
          existing.channelName = seed.channelName;
          existing.sortOrder = seed.sortOrder;
          await this.videoRepository.save(existing);
        } else {
          await this.videoRepository.save(this.videoRepository.create(seed));
        }
      }
      console.log('🌱 Successfully seeded/updated 3 videos!');
    }
  }

  private async getAuthToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && now < this.tokenExpiry) {
      return this.cachedToken!;
    }

    const storeCode = process.env.POS_STORE_CODE || 'aizen';
    const email = process.env.POS_ADMIN_EMAIL || 'baohoaitran3112@gmail.com';
    const password = process.env.POS_ADMIN_PASSWORD || '123456';
    const apiUrl = process.env.POS_API_URL || 'http://103.188.82.245:6001';

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode, email, password }),
      });
      const json = (await response.json()) as any;
      if (json.success && json.data?.token) {
        this.cachedToken = json.data.token;
        this.tokenExpiry = now + 6 * 24 * 60 * 60 * 1000; // Cache for 6 days
        return json.data.token;
      }
      throw new Error(`POS login failed: ${JSON.stringify(json)}`);
    } catch (err) {
      console.error('Failed to authenticate with POS API:', err);
      throw err;
    }
  }

  public async posFetch<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any,
    useAuthToken = false,
  ): Promise<T> {
    const apiUrl = process.env.POS_API_URL || 'http://103.188.82.245:6001';
    const storeCode = process.env.POS_STORE_CODE || 'aizen';
    const apiKey = process.env.POS_API_KEY || 'pk_52623926435f4abe50a7de1c7152bf5c8aae264af8f5870b';

    const headers: Record<string, string> = {
      'X-Store-Code': storeCode,
    };

    if (useAuthToken) {
      const token = await this.getAuthToken();
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['X-API-Key'] = apiKey;
    }

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${apiUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text();
    let json: any;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error(`Invalid JSON response from POS: ${text}`);
    }

    if (!response.ok) {
      throw new Error(
        `POS API error [${response.status}]: ${json.message || json.error || text}`,
      );
    }

    return json as T;
  }

  private mapPosToArticle(posPost: any): Article {
    const content = posPost.content || '';
    const match = content.match(/<!--blogHandle:(\w+)-->/);
    const blogHandle = match ? match[1] : 'news';
    const contentHtml = content.replace(/<!--blogHandle:\w+-->/, '');

    const article = new Article();
    article.id = posPost.id;
    article.blogHandle = blogHandle;
    article.title = posPost.title;
    article.slug = posPost.slug;
    article.contentHtml = contentHtml;
    article.imageUrl = posPost.thumbnail || null;
    article.status = posPost.status;
    article.publishedAt = posPost.published_at ? new Date(posPost.published_at) : (null as any);
    article.createdAt = posPost.created_at ? new Date(posPost.created_at) : new Date();
    article.updatedAt = posPost.updated_at ? new Date(posPost.updated_at) : new Date();
    return article;
  }

  private mapArticleToPos(dto: any, currentHandle?: string): any {
    const posPost: any = {};
    if (dto.title !== undefined) posPost.title = dto.title;
    if (dto.slug !== undefined) posPost.slug = dto.slug;
    if (dto.status !== undefined) posPost.status = dto.status;
    if (dto.imageUrl !== undefined) posPost.thumbnail = dto.imageUrl;
    
    if (dto.publishedAt !== undefined) {
      posPost.publishedAt = dto.publishedAt ? new Date(dto.publishedAt).toISOString() : null;
    }

    if (dto.contentHtml !== undefined || dto.blogHandle !== undefined) {
      const handle = dto.blogHandle || currentHandle || 'news';
      const rawContent = dto.contentHtml || '';
      posPost.content = `<!--blogHandle:${handle}-->${rawContent}`;
    }
    return posPost;
  }

  async findAllArticles(status = 'PUBLISHED'): Promise<Article[]> {
    if (status === 'PUBLISHED') {
      const posPosts = await this.posFetch<any[]>('GET', '/api/blog/posts?publishedOnly=true');
      return posPosts.map(p => this.mapPosToArticle(p));
    } else {
      return this.findAllArticlesAdmin();
    }
  }

  async findAllArticlesAdmin(): Promise<Article[]> {
    const posPosts = await this.posFetch<any[]>('GET', '/api/blog/posts');
    return posPosts.map(p => this.mapPosToArticle(p));
  }

  async findArticleBySlug(slug: string): Promise<Article> {
    const articles = await this.findAllArticles('PUBLISHED');
    const article = articles.find(a => a.slug === slug);
    if (!article) {
      throw new NotFoundException(`Article '${slug}' not found`);
    }
    return article;
  }

  async findArticleById(id: string): Promise<Article> {
    const articles = await this.findAllArticlesAdmin();
    const article = articles.find(a => a.id === id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  async createArticle(dto: {
    blogHandle?: string;
    title: string;
    slug: string;
    contentHtml: string;
    authorId?: string;
    status?: string;
  }): Promise<Article> {
    const posBody = this.mapArticleToPos(dto);
    const posPost = await this.posFetch<any>('POST', '/api/blog/posts', posBody);
    return this.mapPosToArticle(posPost);
  }

  async updateArticle(id: string, dto: any): Promise<Article> {
    const existing = await this.findArticleById(id);
    const posBody = this.mapArticleToPos(dto, existing.blogHandle);
    const posPost = await this.posFetch<any>('PUT', `/api/blog/posts/${id}`, posBody, true);
    return this.mapPosToArticle(posPost);
  }

  async deleteArticle(id: string): Promise<void> {
    await this.posFetch<void>('DELETE', `/api/blog/posts/${id}`, undefined, true);
  }

  async toggleArticleStatus(id: string): Promise<Article> {
    const existing = await this.findArticleById(id);
    const newStatus = existing.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const posPost = await this.posFetch<any>('PUT', `/api/blog/posts/${id}`, { status: newStatus }, true);
    return this.mapPosToArticle(posPost);
  }

  async createBanner(dto: {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    position?: string;
    sortOrder?: number;
    isActive?: boolean;
    startsAt?: Date;
    endsAt?: Date;
  }): Promise<Banner> {
    const banner = this.bannerRepository.create(dto);
    return this.bannerRepository.save(banner);
  }

  async findAllBanners(): Promise<Banner[]> {
    return this.bannerRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findAllVideos(): Promise<Video[]> {
    return this.videoRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findVideoById(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({ where: { id } });
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return video;
  }

  async createVideo(dto: {
    title: string;
    youtubeUrl: string;
    thumbnailUrl: string;
    channelName: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<Video> {
    const video = this.videoRepository.create({
      ...dto,
      publishedAt: new Date(),
    });
    return this.videoRepository.save(video);
  }

  async updateVideo(
    id: string,
    dto: {
      title?: string;
      youtubeUrl?: string;
      thumbnailUrl?: string;
      channelName?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ): Promise<Video> {
    const video = await this.findVideoById(id);
    Object.assign(video, dto);
    return this.videoRepository.save(video);
  }

  async deleteVideo(id: string): Promise<void> {
    const video = await this.findVideoById(id);
    await this.videoRepository.remove(video);
  }
}
