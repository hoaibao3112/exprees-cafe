import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { Banner } from './entities/banner.entity';

@Injectable()
export class ContentService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

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

    // Seed initial articles
    const articleCount = await this.articleRepository.count();
    if (articleCount === 0) {
      console.log('🌱 Seeding initial articles...');
      const seedArticles = [
        {
          blogHandle: 'news',
          title: 'Bí quyết pha chế cà phê phin đậm đà truyền thống chuẩn vị',
          slug: 'bi-quyet-pha-cafe-phin-dam-da-truyen-thong',
          contentHtml: `
            <p>Pha cà phê phin từ lâu đã trở thành một nét văn hóa nghệ thuật ẩm thực độc đáo của người Việt Nam. Tuy nhiên, để chiết xuất được một tách cà phê phin sánh mịn, hương thơm nồng nàn không phải là điều đơn giản.</p>
            <h3>1. Lựa chọn hạt cà phê nguyên chất</h3>
            <p>Hạt cà phê Robusta chất lượng cao vùng Tây Nguyên là lựa chọn hàng đầu cho tách cà phê phin truyền thống đậm vị đắng và hậu ngọt dịu.</p>
            <h3>2. Kỹ thuật ủ bột cà phê</h3>
            <p>Luôn rót khoảng 20ml nước sôi (nhiệt độ khoảng 92 - 95 độ C) vào đáy phin và nắp phin trước để làm nóng bột cà phê. Ủ trong vòng 1-2 phút cho bột nở đều trước khi châm thêm nước lần hai.</p>
          `,
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
        {
          blogHandle: 'recipes',
          title: 'Cà phê Specialty là gì? Khám phá xu hướng F&B hiện đại',
          slug: 'ca-phe-specialty-la-gi-xu-huong-fb-hien-dai',
          contentHtml: `
            <p>Specialty Coffee (cà phê đặc sản) không đơn thuần là một tách nước uống chứa cafein mà là câu chuyện nghệ thuật bắt tay từ nông hộ gieo trồng cho đến nghệ nhân rang xay.</p>
            <h3>1. Tiêu chuẩn đánh giá Specialty Coffee</h3>
            <p>Theo Hiệp hội Cà phê Đặc sản Quốc tế (SCA), các mẫu cà phê đạt điểm thử nếm (Cupping Score) từ 80 điểm trở lên trên thang điểm 100 mới chính thức được công nhận là Specialty Coffee.</p>
            <h3>2. Trải nghiệm hương vị tinh tế</h3>
            <p>Cà phê đặc sản giữ lại trọn vẹn hương vị tự nhiên của thổ nhưỡng, mang nốt hương hoa quả phong phú, vị chua thanh thoát thanh lịch.</p>
          `,
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      ];
      // Note: In case system default user_id isn't present, we fetch the first user in database
      await this.articleRepository.save(this.articleRepository.create(seedArticles));
      console.log('🌱 Successfully seeded 2 blog articles!');
    }
  }

  async createArticle(dto: {
    blogHandle?: string;
    title: string;
    slug: string;
    contentHtml: string;
    authorId: string;
    status?: string;
  }): Promise<Article> {
    const article = this.articleRepository.create(dto);
    if (dto.status === 'PUBLISHED') {
      article.publishedAt = new Date();
    }
    return this.articleRepository.save(article);
  }

  async findAllArticles(status = 'PUBLISHED'): Promise<Article[]> {
    return this.articleRepository.find({
      where: { status },
      order: { publishedAt: 'DESC' },
    });
  }

  async findArticleBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { slug, status: 'PUBLISHED' } });
    if (!article) {
      throw new NotFoundException(`Article '${slug}' not found`);
    }
    return article;
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
}
