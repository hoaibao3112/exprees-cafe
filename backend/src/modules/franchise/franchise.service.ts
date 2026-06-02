import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FranchisePackage } from './entities/franchise-package.entity';
import { FranchiseApplication } from './entities/franchise-application.entity';

@Injectable()
export class FranchiseService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(FranchisePackage)
    private readonly packageRepository: Repository<FranchisePackage>,
    @InjectRepository(FranchiseApplication)
    private readonly applicationRepository: Repository<FranchiseApplication>,
  ) {}

  async onApplicationBootstrap() {
    console.log('🌱 Checking / Seeding franchise packages...');
    const seedPackages = [
      {
        name: 'Gói KIOSK - Tối ưu mặt tiền phố',
        modelType: 'KIOSK',
        investmentFrom: 250000000,
        description: 'Phù hợp với các vị trí vỉa hè, xe đẩy công nghệ, mặt bằng nhỏ từ 10m2 - 15m2. Tập trung bán mang đi (Take-away) và giao hàng nhanh.',
        images: [
          'uploads/franchise_packages/12_4fdf85ea2b2e493a987da2acd6f82719_master.png',
          'uploads/franchise_packages/13_c47eba03de2c4ccd8e309e2ea6f326cf_master.png',
          'uploads/franchise_packages/chi_nhanh_4_b74f498741454c369ba80596937dba5e.jpg',
          'uploads/franchise_packages/anh_man_hinh_2024-12-09_luc_20.59.26_6af3192694c541b6809c9aa937cd103b_master.png',
        ],
        isActive: true,
      },
      {
        name: 'Gói EXPRESS - Cửa hàng hiện đại',
        modelType: 'EXPRESS',
        investmentFrom: 600000000,
        description: 'Mô hình cửa hàng tiêu chuẩn diện tích 50m2 - 80m2. Không gian kính sang trọng, tích hợp phục vụ tại chỗ sang xịn mịn và mang đi tiện lợi.',
        images: [
          'uploads/franchise_packages/nq_4_8328d8a2554249559153dec50ae01920_master.jpg',
          'uploads/franchise_packages/nq_3_8e062ac5d77f467aa89be70b7a820884_master.jpg',
          'uploads/franchise_packages/nh__ng_quy_n_express_cafe_1_2eaf098dfe134cebab3ef252fee56a9b_mastera_524595bfef8948e8928688650634cc63_master.png',
          'uploads/franchise_packages/11_408fc62281db4fcc8cdc9856494bded8_master.png',
        ],
        isActive: true,
      },
      {
        name: 'Gói PREMIUM - Flagship đẳng cấp',
        modelType: 'PREMIUM',
        investmentFrom: 1500000000,
        description: 'Cửa hàng trải nghiệm cao cấp diện tích từ 150m2 trở lên ở ngã tư sầm uất hoặc trung tâm thương mại. Thiết kế đẳng cấp, thu hút giới trẻ.',
        images: [
          'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=800',
        ],
        isActive: true,
      },
    ];

    for (const seed of seedPackages) {
      const existing = await this.packageRepository.findOne({ where: { name: seed.name } });
      if (existing) {
        existing.images = seed.images;
        existing.investmentFrom = seed.investmentFrom;
        existing.description = seed.description;
        existing.modelType = seed.modelType;
        await this.packageRepository.save(existing);
      } else {
        await this.packageRepository.save(this.packageRepository.create(seed));
      }
    }
    console.log('🌱 Successfully seeded/updated 3 franchise packages!');
  }

  async createPackage(dto: {
    name: string;
    modelType: string;
    investmentFrom: number;
    description?: string;
    isActive?: boolean;
  }): Promise<FranchisePackage> {
    const pkg = this.packageRepository.create(dto);
    return this.packageRepository.save(pkg);
  }

  async findAllPackages(onlyActive = true): Promise<FranchisePackage[]> {
    const where: any = {};
    if (onlyActive) {
      where.isActive = true;
    }
    return this.packageRepository.find({
      where,
      order: { investmentFrom: 'ASC' },
    });
  }

  async findPackageById(id: string): Promise<FranchisePackage> {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new NotFoundException(`Franchise package with ID ${id} not found`);
    }
    return pkg;
  }

  async apply(
    userId: string,
    dto: {
      packageId: string;
      applicantName: string;
      phone: string;
      province: string;
      notes?: string;
    },
  ): Promise<FranchiseApplication> {
    await this.findPackageById(dto.packageId); // Verify package exists

    const application = this.applicationRepository.create({
      ...dto,
      userId,
      status: 'PENDING',
    });
    return this.applicationRepository.save(application);
  }

  async findAllApplications(): Promise<FranchiseApplication[]> {
    return this.applicationRepository.find({
      relations: ['package', 'user'],
      order: { submittedAt: 'DESC' },
    });
  }

  async updateApplicationStatus(id: string, status: string, notes?: string): Promise<FranchiseApplication> {
    const app = await this.applicationRepository.findOne({ where: { id } });
    if (!app) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    app.status = status;
    if (notes) {
      app.notes = notes;
    }
    return this.applicationRepository.save(app);
  }
}
