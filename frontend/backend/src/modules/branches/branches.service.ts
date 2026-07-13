import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { ContentService } from '../content/content.service';

@Injectable()
export class BranchesService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly contentService: ContentService,
  ) {}

  async onApplicationBootstrap() {
    // We keep SQLite seeding code for local fallback purposes in case POS is offline,
    // but the API operations will prioritize POS.
    console.log('🌱 Seeding initial branches for local SQLite fallback...');
    
    const fs = require('fs');
    const path = require('path');
    const possiblePaths = [
      path.join(process.cwd(), '../../scraped_data/branches_new.json'),
      path.join(process.cwd(), '../scraped_data/branches_new.json'),
      path.join(process.cwd(), './scraped_data/branches_new.json'),
      path.join(__dirname, '../../../../scraped_data/branches_new.json'),
      path.join(__dirname, '../../../../../scraped_data/branches_new.json'),
    ];

    let branchesJsonPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        branchesJsonPath = p;
        break;
      }
    }
    
    let seedBranches = [];
    try {
      if (branchesJsonPath && fs.existsSync(branchesJsonPath)) {
        const data = fs.readFileSync(branchesJsonPath, 'utf8');
        const scrapedBranches = JSON.parse(data);
        
        seedBranches = scrapedBranches.map((branch: any) => ({
          name: branch.name,
          url: branch.url,
          description: branch.description,
          address: branch.description.includes('Địa chỉ:') 
            ? branch.description.split('Địa chỉ:')[1]?.split('\n')[0]?.trim() || ''
            : '',
          lat: 10.7769, 
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
      }
    } catch (error) {
      console.error('Error loading scraped branches data:', error);
    }
    
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
    console.log('🌱 Successfully seeded local SQLite fallback branches!');
  }

  private mapPosToBranch(pos: any): Branch {
    const branch = new Branch();
    branch.id = pos.id;
    branch.name = pos.name;
    branch.address = pos.location || 'Địa chỉ chưa cập nhật';
    branch.lat = pos.latitude ? Number(pos.latitude) : 10.7769; 
    branch.lng = pos.longitude ? Number(pos.longitude) : 106.7009; 
    branch.phone = '0909666792'; 
    branch.openingHours = { open: '06:30', close: '22:30' }; 
    branch.status = pos.is_active ? 'ACTIVE' : 'INACTIVE';
    branch.isFlagship = pos.type === 'MAIN'; 
    branch.imageUrl = null as any;
    branch.images = [];
    branch.createdAt = pos.created_at ? new Date(pos.created_at) : new Date();
    branch.updatedAt = pos.updated_at ? new Date(pos.updated_at) : new Date();
    return branch;
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
    try {
      const payload = {
        code: 'BR_' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        name: createDto.name,
        location: createDto.address,
        latitude: createDto.lat,
        longitude: createDto.lng,
        is_active: createDto.status !== 'INACTIVE',
        type: createDto.isFlagship ? 'MAIN' : 'STORE'
      };

      const res = await this.contentService.posFetch<{ success: boolean; data: any }>('POST', '/api/warehouses', payload, true);
      if (res?.success && res.data) {
        return this.mapPosToBranch(res.data);
      }
    } catch (err) {
      console.error('POS API error creating warehouse, falling back to local SQLite:', err);
    }

    // SQLite Fallback
    const branch = this.branchRepository.create(createDto);
    return this.branchRepository.save(branch);
  }

  async findAll(status?: string): Promise<Branch[]> {
    try {
      const res = await this.contentService.posFetch<{ success: boolean; data: any[] }>('GET', '/api/warehouses', undefined, true);
      const posWarehouses = res?.data || [];
      const branches = posWarehouses.map(w => this.mapPosToBranch(w));
      
      if (status) {
        return branches.filter(b => b.status === status);
      }
      return branches;
    } catch (err) {
      console.error('POS API error fetching warehouses, falling back to local SQLite:', err);
    }

    // SQLite Fallback
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
    try {
      const res = await this.contentService.posFetch<{ success: boolean; data: any }>('GET', `/api/warehouses/${id}`, undefined, true);
      if (res?.success && res.data) {
        return this.mapPosToBranch(res.data);
      }
    } catch (err) {
      console.error(`POS API error fetching warehouse ${id}, falling back to local SQLite:`, err);
    }

    // SQLite Fallback
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
    try {
      const payload: any = {};
      if (updateDto.name !== undefined) payload.name = updateDto.name;
      if (updateDto.address !== undefined) payload.location = updateDto.address;
      if (updateDto.lat !== undefined) payload.latitude = updateDto.lat;
      if (updateDto.lng !== undefined) payload.longitude = updateDto.lng;
      if (updateDto.status !== undefined) payload.is_active = updateDto.status === 'ACTIVE';
      if (updateDto.isFlagship !== undefined) payload.type = updateDto.isFlagship ? 'MAIN' : 'STORE';

      const res = await this.contentService.posFetch<{ success: boolean; data: any }>('PUT', `/api/warehouses/${id}`, payload, true);
      const data = res?.data?.warehouse || res?.data;
      if (data) {
        return this.mapPosToBranch(data);
      }
    } catch (err) {
      console.error(`POS API error updating warehouse ${id}, falling back to local SQLite:`, err);
    }

    // SQLite Fallback
    const branch = await this.findOne(id);
    Object.assign(branch, updateDto);
    return this.branchRepository.save(branch);
  }

  async remove(id: string): Promise<void> {
    try {
      const res = await this.contentService.posFetch<{ success: boolean }>('DELETE', `/api/warehouses/${id}`, undefined, true);
      if (res?.success) {
        return;
      }
    } catch (err) {
      console.error(`POS API error deleting warehouse ${id}, falling back to local SQLite:`, err);
    }

    // SQLite Fallback
    const branch = await this.findOne(id);
    await this.branchRepository.remove(branch);
  }

  async findNearest(lat: number, lng: number, maxDistanceKm: number = 50): Promise<(Branch & { distanceKm: number })[]> {
    let branches: Branch[] = [];
    try {
      branches = await this.findAll('ACTIVE');
    } catch (err) {
      console.error('POS API error for findNearest, falling back to local SQLite:', err);
      branches = await this.branchRepository.find({ where: { status: 'ACTIVE' } });
    }
    
    const results = branches.map((branch) => {
      const distance = this.calculateDistance(lat, lng, branch.lat, branch.lng);
      return {
        ...branch,
        distanceKm: Math.round(distance * 100) / 100, 
      };
    });

    return results
      .filter((b) => b.distanceKm <= maxDistanceKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; 
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
