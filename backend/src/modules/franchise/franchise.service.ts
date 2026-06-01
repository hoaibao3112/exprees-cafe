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
    const count = await this.packageRepository.count();
    if (count === 0) {
      console.log('🌱 Seeding initial franchise packages...');
      const seedPackages = [
        {
          name: 'Gói KIOSK - Tối ưu mặt tiền phố',
          modelType: 'KIOSK',
          investmentFrom: 250000000,
          description: 'Phù hợp với các vị trí vỉa hè, xe đẩy công nghệ, mặt bằng nhỏ từ 10m2 - 15m2. Tập trung bán mang đi (Take-away) và giao hàng nhanh.',
          isActive: true,
        },
        {
          name: 'Gói EXPRESS - Cửa hàng hiện đại',
          modelType: 'EXPRESS',
          investmentFrom: 600000000,
          description: 'Mô hình cửa hàng tiêu chuẩn diện tích 50m2 - 80m2. Không gian kính sang trọng, tích hợp phục vụ tại chỗ sang xịn mịn và mang đi tiện lợi.',
          isActive: true,
        },
        {
          name: 'Gói PREMIUM - Flagship đẳng cấp',
          modelType: 'PREMIUM',
          investmentFrom: 1500000000,
          description: 'Cửa hàng trải nghiệm cao cấp diện tích từ 150m2 trở lên ở ngã tư sầm uất hoặc trung tâm thương mại. Thiết kế đẳng cấp, thu hút giới trẻ.',
          isActive: true,
        },
      ];
      await this.packageRepository.save(this.packageRepository.create(seedPackages));
      console.log('🌱 Successfully seeded 3 franchise packages!');
    }
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
