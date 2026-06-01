import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchesService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.branchRepository.count();
    if (count === 0) {
      console.log('🌱 Seeding initial branches...');
      const seedBranches = [
        {
          name: 'Express Cafe - Quận 1 (Flagship)',
          address: '120 Hai Bà Trưng, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh',
          lat: 10.782,
          lng: 106.696,
          phone: '028 9999 1201',
          openingHours: { open: '07:00', close: '22:30' },
          status: 'ACTIVE',
          isFlagship: true,
        },
        {
          name: 'Express Cafe - Landmark 81',
          address: 'Tầng trệt L81, Vinhomes Central Park, Bình Thạnh, TP. Hồ Chí Minh',
          lat: 10.795,
          lng: 106.722,
          phone: '028 9999 8181',
          openingHours: { open: '08:00', close: '22:00' },
          status: 'ACTIVE',
          isFlagship: false,
        },
        {
          name: 'Express Cafe - Hoàn Kiếm',
          address: '12 Lý Thái Tổ, Tràng Tiền, Hoàn Kiếm, Hà Nội',
          lat: 21.028,
          lng: 105.854,
          phone: '024 9999 1212',
          openingHours: { open: '07:00', close: '22:00' },
          status: 'ACTIVE',
          isFlagship: true,
        },
        {
          name: 'Express Cafe - Bạch Đằng',
          address: '50 Bạch Đằng, Hải Châu 1, Hải Châu, Đà Nẵng',
          lat: 16.068,
          lng: 108.224,
          phone: '0236 9999 5050',
          openingHours: { open: '07:30', close: '22:30' },
          status: 'ACTIVE',
          isFlagship: false,
        },
      ];
      await this.branchRepository.save(this.branchRepository.create(seedBranches));
      console.log('🌱 Successfully seeded 4 cities branches!');
    }
  }

  async create(createDto: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    phone?: string;
    openingHours?: any;
    status?: string;
    isFlagship?: boolean;
  }): Promise<Branch> {
    const branch = this.branchRepository.create(createDto);
    return this.branchRepository.save(branch);
  }

  async findAll(status?: string): Promise<Branch[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.branchRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async update(
    id: string,
    updateDto: Partial<{
      name: string;
      address: string;
      lat: number;
      lng: number;
      phone: string;
      openingHours: any;
      status: string;
      isFlagship: boolean;
    }>,
  ): Promise<Branch> {
    const branch = await this.findOne(id);
    Object.assign(branch, updateDto);
    return this.branchRepository.save(branch);
  }

  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchRepository.remove(branch);
  }

  async findNearest(lat: number, lng: number, maxDistanceKm: number = 50): Promise<(Branch & { distanceKm: number })[]> {
    const branches = await this.branchRepository.find({ where: { status: 'ACTIVE' } });
    
    const results = branches.map((branch) => {
      const distance = this.calculateDistance(lat, lng, branch.lat, branch.lng);
      return {
        ...branch,
        distanceKm: Math.round(distance * 100) / 100, // round to 2 decimal places
      };
    });

    // Filter by max distance and sort nearest first
    return results
      .filter((b) => b.distanceKm <= maxDistanceKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
