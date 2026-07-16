import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../content/entities/banner.entity';
import { Branch } from '../branches/entities/branch.entity';
import { ContentService } from '../content/content.service';
import { BranchesService } from '../branches/branches.service';
import { Setting } from './entities/setting.entity';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly contentService: ContentService,
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly branchesService: BranchesService,
  ) {}

  // In-memory contacts store
  private contacts = [
    { id: '1', name: 'Sarah Jenkins', email: 'sarah@gmail.com', phone: '0901234567', message: 'Tôi có mặt bằng kinh doanh tại trung tâm quận Hoàn Kiếm, rất mong muốn được tìm hiểu nhượng quyền...', isRead: false, createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
    { id: '2', name: 'Michael Chen', email: 'michael@gmail.com', phone: '0912345678', message: 'Chúng tôi muốn đặt tiệc trà/cà phê cho buổi hội nghị công nghệ khoảng 200 khách...', isRead: false, createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { id: '3', name: 'Emma Thompson', email: 'emma@gmail.com', phone: '0934567890', message: 'Không gian quán tại Bến Vân Đồn rất đẹp và nhân viên cực kỳ thân thiện...', isRead: true, createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
    { id: '4', name: 'David Wilson', email: 'david@gmail.com', phone: '0978901234', message: 'Đại diện hợp tác xã cà phê Arabica Cầu Đất, chúng tôi xin cung cấp mẫu thử nguyên chất...', isRead: true, createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
  ];

  // Default settings configuration baseline
  private defaultSettings: Record<string, string | boolean | number> = {
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
    const totalServices = await this.serviceRepository.count();
    const branches = await this.branchesService.findAll();
    const totalBranches = branches.length;
    const activeBanners = await this.bannerRepository.count({ where: { isActive: true } });
    const unreadContacts = this.contacts.filter(c => !c.isRead).length;

    const recentServices = await this.serviceRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalServices,
      totalBranches,
      activeBanners,
      unreadContacts,
      recentServices,
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
    
    // Safely parse date fields
    if (dto.startsAt !== undefined) {
      dto.startsAt = dto.startsAt ? new Date(dto.startsAt) : undefined;
    }
    if (dto.endsAt !== undefined) {
      dto.endsAt = dto.endsAt ? new Date(dto.endsAt) : undefined;
    }
    if (dto.linkUrl !== undefined) {
      dto.linkUrl = dto.linkUrl || undefined;
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

  async createBanner(dto: any) {
    const maxSortOrderBanner = await this.bannerRepository.findOne({
      where: {},
      order: { sortOrder: 'DESC' },
    });
    const nextSortOrder = maxSortOrderBanner ? maxSortOrderBanner.sortOrder + 1 : 1;

    const banner = this.bannerRepository.create({
      title: dto.title,
      imageUrl: dto.imageUrl,
      linkUrl: dto.linkUrl || undefined,
      position: dto.position || 'HOME_HERO',
      sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : nextSortOrder,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
    });
    return this.bannerRepository.save(banner);
  }

  async deleteBanner(id: string) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    await this.bannerRepository.remove(banner);
  }

  // --- ARTICLES CRUD ---
  async getArticles(params?: any) {
    let items = await this.contentService.findAllArticlesAdmin();
    if (params?.blogHandle) {
      items = items.filter(item => item.blogHandle === params.blogHandle);
    }
    return {
      items,
      total: items.length,
      page: 1,
      limit: 100,
    };
  }

  async getArticleById(id: string) {
    return this.contentService.findArticleById(id);
  }

  async createArticle(dto: any) {
    return this.contentService.createArticle(dto);
  }

  async updateArticle(id: string, dto: any) {
    return this.contentService.updateArticle(id, dto);
  }

  async deleteArticle(id: string) {
    await this.contentService.deleteArticle(id);
  }

  async toggleArticleStatus(id: string) {
    return this.contentService.toggleArticleStatus(id);
  }

  // --- BRANCHES CRUD ---
  async getBranches() {
    const items = await this.branchesService.findAll();
    return {
      items,
      total: items.length,
    };
  }

  async getBranchById(id: string) {
    return this.branchesService.findOne(id);
  }

  async createBranch(dto: Partial<Branch>) {
    return this.branchesService.create({
      name: dto.name || '',
      address: dto.address || '',
      lat: dto.lat || 10.7769,
      lng: dto.lng || 106.7009,
      phone: dto.phone,
      openingHours: dto.openingHours,
      status: dto.status,
      isFlagship: dto.isFlagship
    });
  }

  async updateBranch(id: string, dto: any) {
    return this.branchesService.update(id, dto);
  }

  async deleteBranch(id: string) {
    await this.branchesService.remove(id);
  }

  async toggleBranchStatus(id: string) {
    const branch = await this.getBranchById(id);
    const newStatus = branch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.branchesService.update(id, { status: newStatus });
  }

  // --- SETTINGS ---
  async getSettings() {
    const dbSettings = await this.settingRepository.find();
    
    // Seed default settings if database table is empty
    if (dbSettings.length === 0) {
      for (const [key, value] of Object.entries(this.defaultSettings)) {
        const valStr = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
        await this.settingRepository.save({ key, value: valStr });
      }
      return this.defaultSettings;
    }

    const settingsObj: Record<string, string | boolean | number> = {};
    // Initialize settings with defaults
    Object.assign(settingsObj, this.defaultSettings);

    // Overlay values fetched from SQLite database
    dbSettings.forEach((s) => {
      const defaultValue = this.defaultSettings[s.key];
      if (defaultValue !== undefined) {
        if (typeof defaultValue === 'boolean') {
          settingsObj[s.key] = s.value === 'true' || s.value === '1';
        } else if (typeof defaultValue === 'number') {
          settingsObj[s.key] = Number(s.value);
        } else {
          settingsObj[s.key] = s.value;
        }
      } else {
        settingsObj[s.key] = s.value;
      }
    });

    return settingsObj;
  }

  async updateSettings(dto: any) {
    for (const [key, value] of Object.entries(dto)) {
      const valStr = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
      
      let setting = await this.settingRepository.findOne({ where: { key } });
      if (!setting) {
        setting = this.settingRepository.create({ key, value: valStr });
      } else {
        setting.value = valStr;
      }
      await this.settingRepository.save(setting);
    }
    return this.getSettings();
  }
}
