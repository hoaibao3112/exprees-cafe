import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../content/entities/article.entity';
import { Banner } from '../content/entities/banner.entity';
import { Branch } from '../branches/entities/branch.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  // In-memory contacts store
  private contacts = [
    { id: '1', name: 'Sarah Jenkins', email: 'sarah@gmail.com', phone: '0901234567', message: 'Tôi có mặt bằng kinh doanh tại trung tâm quận Hoàn Kiếm, rất mong muốn được tìm hiểu nhượng quyền...', isRead: false, createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
    { id: '2', name: 'Michael Chen', email: 'michael@gmail.com', phone: '0912345678', message: 'Chúng tôi muốn đặt tiệc trà/cà phê cho buổi hội nghị công nghệ khoảng 200 khách...', isRead: false, createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { id: '3', name: 'Emma Thompson', email: 'emma@gmail.com', phone: '0934567890', message: 'Không gian quán tại Bến Vân Đồn rất đẹp và nhân viên cực kỳ thân thiện...', isRead: true, createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
    { id: '4', name: 'David Wilson', email: 'david@gmail.com', phone: '0978901234', message: 'Đại diện hợp tác xã cà phê Arabica Cầu Đất, chúng tôi xin cung cấp mẫu thử nguyên chất...', isRead: true, createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
  ];

  // In-memory settings store
  private settings: Record<string, string | boolean | number> = {
    brandName: 'Express Cafe',
    slogan: 'Mỹ thuật Rang Xay & Công nghệ SAAS',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    contactEmail: 'contact@expresscafe.vn',
    contactPhone: '0909 666 792',
    address: 'Khu dân cư Conic Garden – Bình Chánh, TP. Hồ Chí Minh',
    facebookUrl: 'https://facebook.com/expresscafe',
    youtubeUrl: 'https://youtube.com/expresscafe',
    tiktokUrl: 'https://tiktok.com/@expresscafe',
    heroEnabled: true,
    heroHeading: 'CHO THUÊ MÁY PHA CÀ PHÊ',
    heroSubtitle: 'Giải pháp chuyên nghiệp cho văn phòng, nhà hàng và chuỗi kinh doanh F&B',
    heroCtaText: 'Đăng Ký Tư Vấn',
    heroCtaLink: '/franchise/register',
    heroBgImage: '/slideshow_1.jpg',
    bannerSlideshowEnabled: true,
    blogSectionEnabled: true,
    blogSectionTitle: 'TIN TỨC MỚI NHẤT',
    blogSectionCount: 3,
    branchSectionEnabled: true,
    branchSectionTitle: 'HỆ THỐNG CHI NHÁNH',
    serviceSectionEnabled: true,
    primaryColor: '#f07b22',
    secondaryColor: '#18181b',
    darkMode: false,
    seoTitle: 'Express Cafe - Cà Phê Rang Xay Nguyên Chất',
    seoDescription: 'Express Cafe cung cấp giải pháp cà phê chất lượng cao và dịch vụ chu đáo.',
    seoKeywords: 'express cafe, ca phe sach, ca phe nguyen chat',
  };

  // --- DASHBOARD ---
  async getDashboardStats() {
    const totalArticles = await this.articleRepository.count();
    const totalBranches = await this.branchRepository.count();
    const activeBanners = await this.bannerRepository.count({ where: { isActive: true } });
    const unreadContacts = this.contacts.filter(c => !c.isRead).length;

    const recentArticles = await this.articleRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalArticles,
      totalBranches,
      activeBanners,
      unreadContacts,
      recentArticles,
      recentContacts: this.contacts.slice(0, 5),
    };
  }

  // --- CONTACTS ---
  async getContacts() {
    return {
      items: this.contacts,
      total: this.contacts.length,
    };
  }

  async submitContact(dto: Record<string, unknown>) {
    const nameStr = typeof dto.name === 'string' ? dto.name : 'Anonymous';
    const emailStr = typeof dto.email === 'string' ? dto.email : '';
    const phoneStr = typeof dto.phone === 'string' ? dto.phone : '';
    const messageStr = typeof dto.content === 'string' ? dto.content : '';

    const newContact = {
      id: String(this.contacts.length + 1),
      name: nameStr,
      email: emailStr,
      phone: phoneStr,
      message: messageStr,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.contacts.unshift(newContact);
    return newContact;
  }

  async markContactRead(id: string) {
    const contact = this.contacts.find(c => c.id === id);
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    contact.isRead = true;
    return contact;
  }

  // --- BANNERS ---
  async getBanners() {
    return this.bannerRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async updateBanner(id: string, dto: any) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    if (dto.order !== undefined) {
      banner.sortOrder = dto.order;
    }
    Object.assign(banner, dto);
    return this.bannerRepository.save(banner);
  }

  async reorderBanners(items: { id: string; order: number }[]) {
    for (const item of items) {
      const banner = await this.bannerRepository.findOne({ where: { id: item.id } });
      if (banner) {
        banner.sortOrder = item.order;
        await this.bannerRepository.save(banner);
      }
    }
  }

  // --- ARTICLES CRUD ---
  async getArticles(params?: any) {
    const where: any = {};
    if (params?.blogHandle) {
      where.blogHandle = params.blogHandle;
    }
    const items = await this.articleRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return {
      items,
      total: items.length,
      page: 1,
      limit: 100,
    };
  }

  async getArticleById(id: string) {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  async createArticle(dto: Partial<Article>) {
    const article = this.articleRepository.create({
      ...dto,
      publishedAt: dto.status === 'PUBLISHED' ? new Date() : dto.publishedAt,
    });
    return this.articleRepository.save(article);
  }

  async updateArticle(id: string, dto: any) {
    const article = await this.getArticleById(id);
    if (dto.status === 'PUBLISHED' && article.status !== 'PUBLISHED') {
      article.publishedAt = new Date();
    }
    Object.assign(article, dto);
    return this.articleRepository.save(article);
  }

  async deleteArticle(id: string) {
    const article = await this.getArticleById(id);
    await this.articleRepository.remove(article);
  }

  async toggleArticleStatus(id: string) {
    const article = await this.getArticleById(id);
    article.status = article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    if (article.status === 'PUBLISHED') {
      article.publishedAt = new Date();
    }
    return this.articleRepository.save(article);
  }

  // --- BRANCHES CRUD ---
  async getBranches() {
    const items = await this.branchRepository.find({
      order: { createdAt: 'DESC' },
    });
    return {
      items,
      total: items.length,
    };
  }

  async getBranchById(id: string) {
    const branch = await this.branchRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async createBranch(dto: Partial<Branch>) {
    const branch = this.branchRepository.create(dto);
    return this.branchRepository.save(branch);
  }

  async updateBranch(id: string, dto: any) {
    const branch = await this.getBranchById(id);
    Object.assign(branch, dto);
    return this.branchRepository.save(branch);
  }

  async deleteBranch(id: string) {
    const branch = await this.getBranchById(id);
    await this.branchRepository.remove(branch);
  }

  async toggleBranchStatus(id: string) {
    const branch = await this.getBranchById(id);
    branch.status = branch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.branchRepository.save(branch);
  }

  // --- SETTINGS ---
  async getSettings() {
    return this.settings;
  }

  async updateSettings(dto: any) {
    Object.assign(this.settings, dto);
  }
}
