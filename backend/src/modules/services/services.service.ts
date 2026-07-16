import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';

@Injectable()
export class ServicesService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async onApplicationBootstrap() {
    console.log('🌱 Seeding initial services from scraped data...');
    
    // Read scraped data from JSON file
    const fs = require('fs');
    const path = require('path');
    
    const possiblePaths = [
      path.join(process.cwd(), '../../scraped_data/services.json'),
      path.join(process.cwd(), '../scraped_data/services.json'),
      path.join(process.cwd(), './scraped_data/services.json'),
      path.join(__dirname, '../../../../scraped_data/services.json'),
      path.join(__dirname, '../../../../../scraped_data/services.json'),
    ];

    let servicesJsonPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        servicesJsonPath = p;
        break;
      }
    }
    
    let seedServices = [];
    try {
      if (servicesJsonPath && fs.existsSync(servicesJsonPath)) {
        const data = fs.readFileSync(servicesJsonPath, 'utf8');
        const scrapedServices = JSON.parse(data);
        
        seedServices = scrapedServices.map((service: any) => ({
          name: service.name,
          url: service.url,
          description: service.description,
          imageUrl: service.images && service.images.length > 0 ? `/${service.images[0]}` : null,
          images: service.images || [],
          status: 'ACTIVE'
        }));
        
        console.log(`📖 Loaded ${seedServices.length} services from scraped data`);
      }
    } catch (error) {
      console.error('Error loading scraped services data:', error);
    }
    
    // Fallback to default data if no scraped data
    if (seedServices.length === 0) {
      seedServices = [
        {
          "name": "Cung cấp cà phê sỉ",
          "url": "https://expresscafe.com.vn/products/cung-cap-ca-phe-si",
          "description": "Dịch vụ cung cấp cà phê sỉ chuyên nghiệp cho đại lý và quán cà phê.",
          "imageUrl": null,
          "images": [],
          "status": "ACTIVE"
        }
      ];
    }
    
    for (const seed of seedServices) {
      const existing = await this.serviceRepository.findOne({ where: { name: seed.name } });
      if (existing) {
        Object.assign(existing, seed);
        await this.serviceRepository.save(existing);
      } else {
        await this.serviceRepository.save(this.serviceRepository.create(seed));
      }
    }
    console.log('🌱 Successfully seeded services!');
  }

  async create(createDto: {
    name: string;
    url?: string;
    description?: string;
    images?: string[];
    status?: string;
  }): Promise<Service> {
    const service = this.serviceRepository.create(createDto);
    return this.serviceRepository.save(service);
  }

  async findAll(status?: string): Promise<Service[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.serviceRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async update(
    id: string,
    updateDto: Partial<{
      name: string;
      url: string;
      description: string;
      images: string[];
      status: string;
    }>,
  ): Promise<Service> {
    const service = await this.findOne(id);
    Object.assign(service, updateDto);
    return this.serviceRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
  }
}