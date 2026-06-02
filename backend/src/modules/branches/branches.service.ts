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
    console.log('🌱 Seeding initial branches from scraped data...');
    
    // Read scraped data from JSON file
    const fs = require('fs');
    const path = require('path');
    const branchesJsonPath = path.join(process.cwd(), '../../scraped_data/branches_new.json');
    
    let seedBranches = [];
    try {
      if (fs.existsSync(branchesJsonPath)) {
        const data = fs.readFileSync(branchesJsonPath, 'utf8');
        const scrapedBranches = JSON.parse(data);
        
        seedBranches = scrapedBranches.map((branch: any) => ({
          name: branch.name,
          url: branch.url,
          description: branch.description,
          address: branch.description.includes('Địa chỉ:') 
            ? branch.description.split('Địa chỉ:')[1]?.split('\n')[0]?.trim() || ''
            : '',
          lat: 10.7769, // Default HCM coordinates
          lng: 106.7009,
          phone: '0909666792',
          openingHours: {
            open: branch.description.includes('Giờ hoạt động')
              ? branch.description.split('Giờ hoạt động:')[1]?.split('-')[0]?.trim() || '6h30'
              : '6h30',
            close: branch.description.includes('Giờ hoạt động')
              ? branch.description.split('Giờ hoạt động:')[1]?.split('-')[1]?.trim() || '22h30'
              : '22h30'
          },
          status: 'ACTIVE',
          isFlagship: false,
          imageUrl: branch.images && branch.images.length > 0 ? `/${branch.images[0]}` : null,
          images: branch.images || []
        }));
        
        console.log(`📖 Loaded ${seedBranches.length} branches from scraped data`);
      }
    } catch (error) {
      console.error('Error loading scraped branches data:', error);
    }
    
    // Fallback to default data if no scraped data
    if (seedBranches.length === 0) {
      seedBranches = [
        {
          "name": "KHU DÂN CƯ CONIC GARDEN - BÌNH CHÁNH",
          "address": "Khu dân cư Conic Garden – Bình Chánh, TP. Hồ Chí Minh",
          "lat": 10.691838580773862,
          "lng": 106.58698812532964,
          "phone": "0909666792",
          "openingHours": {
            "open": "07:00",
            "close": "22:00"
          },
          "status": "ACTIVE",
          "isFlagship": false,
          "imageUrl": null,
          "images": []
        }
      ];
    }
    
    for (const seed of seedBranches) {
      const existing = await this.branchRepository.findOne({ where: { name: seed.name } });
      if (existing) {
        Object.assign(existing, seed);
        await this.branchRepository.save(existing);
      } else {
        await this.branchRepository.save(this.branchRepository.create(seed));
      }
    }
    console.log('🌱 Successfully seeded branches!');
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
