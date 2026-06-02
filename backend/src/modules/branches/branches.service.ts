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
    console.log('🌱 Seeding initial premium branches...');
    
    const seedBranches = [
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
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/khu-dan-cu-conic-garden-binh-chanh.png"
      },
      {
            "name": "BỆNH VIỆN ĐẠI HỌC Y DƯỢC THÀNH PHỐ HỒ CHÍ MINH (LẦU 3)",
            "address": "Bệnh viện Đại học Y Dược TP. Hồ Chí Minh",
            "lat": 10.778172662862726,
            "lng": 106.68640944070616,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": true,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/benh-vien-dai-hoc-y-duoc-thanh-pho-ho-chi-minh-lau-3.png"
      },
      {
            "name": "BỆNH VIỆN ĐẠI HỌC Y DƯỢC THÀNH PHỐ HỒ CHÍ MINH (SẢNH KHU KHÁM BỆNH)",
            "address": "Sảnh khu khám bệnh, Bệnh viện Đại học Y Dược TP. Hồ Chí Minh",
            "lat": 10.779486210022261,
            "lng": 106.70043123174008,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/benh-vien-dai-hoc-y-duoc-thanh-pho-ho-chi-minh-sanh-khu-kham-benh.png"
      },
      {
            "name": "CẦN THƠ",
            "address": "Khách sạn Mes",
            "lat": 10.029148432989176,
            "lng": 105.77430793599885,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/can-tho.jpg"
      },
      {
            "name": "BẾN VÂN ĐỒN, QUẬN 4",
            "address": "69 Bến Vân Đồn, Phường 13, Quận 4, TP. Hồ Chí Minh",
            "lat": 10.762448867534527,
            "lng": 106.70968372266155,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": true,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/ben-van-don-quan-4.jpg"
      },
      {
            "name": "BỆNH VIỆN ĐẠI HỌC Y DƯỢC CẦN THƠ",
            "address": "Bệnh viện Đại học Y Dược Cần Thơ",
            "lat": 10.026818204086986,
            "lng": 105.7773760099321,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/benh-vien-dai-hoc-y-duoc-can-tho.png"
      },
      {
            "name": "LONG AN",
            "address": "Long An",
            "lat": 10.540782434940887,
            "lng": 106.40700750825816,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/long-an.png"
      },
      {
            "name": "NGUYỄN THÁI HỌC, QUẬN 1",
            "address": "Nguyễn Thái Học, Phường Cầu Ông Lãnh, Quận 1, TP. Hồ Chí Minh",
            "lat": 10.778007155847286,
            "lng": 106.6990677056239,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/nguyen-thai-hoc-quan-1.png"
      },
      {
            "name": "NGUYỄN TRI PHƯƠNG - QUẬN 10",
            "address": "Nguyễn Tri Phương, Phường 4, Quận 10, TP. Hồ Chí Minh",
            "lat": 10.771922473965526,
            "lng": 106.69466276890016,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/nguyen-tri-phuong-quan-10.jpg"
      },
      {
            "name": "HOÀNG HOA THÁM, QUẬN TÂN BÌNH",
            "address": "175 Hoàng Hoa Thám, Phường 13, Quận Tân Bình, TP. Hồ Chí Minh",
            "lat": 10.793607046778869,
            "lng": 106.64651295851519,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/hoang-hoa-tham-quan-tan-binh.jpg"
      },
      {
            "name": "CƯ XÁ VĨNH HỘI, QUẬN 4",
            "address": "&nbsp;",
            "lat": 10.753054098979682,
            "lng": 106.70269759165201,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/cu-xa-vinh-hoi-quan-4.jpg"
      },
      {
            "name": "LẠC LONG QUÂN, QUẬN 11",
            "address": "&nbsp;",
            "lat": 10.779294296936252,
            "lng": 106.70101631732109,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/lac-long-quan-quan-11.png"
      },
      {
            "name": "NGUYỄN TRƯỜNG TỘ, QUẬN 4",
            "address": "&nbsp;",
            "lat": 10.758023210765687,
            "lng": 106.7078649026387,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/nguyen-truong-to-quan-4.png"
      },
      {
            "name": "CMT8, QUẬN 3",
            "address": "153 Cách Mạng Tháng Tám, Phường 5, Quận 3, TP. Hồ Chí Minh",
            "lat": 10.77849756152857,
            "lng": 106.68577045045667,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/cmt8-quan-3.png"
      },
      {
            "name": "LÂM VĂN BỀN, QUẬN 7",
            "address": "Lâm Văn Bền, Phường Tân Quy, Quận 7, TP. Hồ Chí Minh",
            "lat": 10.73496487060389,
            "lng": 106.72580578322804,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/lam-van-ben-quan-7.jpg"
      },
      {
            "name": "KHU ĐÔ THỊ SALA, QUẬN 2",
            "address": "&nbsp;",
            "lat": 10.775178595416621,
            "lng": 106.73596574978008,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": true,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/khu-do-thi-sala-quan-2.png"
      },
      {
            "name": "BẾN TRE",
            "address": "Đại lộ Đồng Khởi, Phú Khương, Bến Tre",
            "lat": 10.24625178272905,
            "lng": 106.38342020449488,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/ben-tre.jpg"
      },
      {
            "name": "LÝ THƯỜNG KIỆT, QUẬN 10",
            "address": "&nbsp;",
            "lat": 10.772390324094385,
            "lng": 106.70009185062844,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/ly-thuong-kiet-quan-10.png"
      },
      {
            "name": "ÚT TỊCH, QUẬN TÂN BÌNH",
            "address": "&nbsp;",
            "lat": 10.792779477872294,
            "lng": 106.65063425736011,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/ut-tich-quan-tan-binh.png"
      },
      {
            "name": "BÀU CÁT, QUẬN TÂN BÌNH",
            "address": "&nbsp;",
            "lat": 10.792659695959669,
            "lng": 106.64669568727565,
            "phone": "0909666792",
            "openingHours": {
                  "open": "07:00",
                  "close": "22:00"
            },
            "status": "ACTIVE",
            "isFlagship": false,
            "imageUrl": "http://localhost:3000/uploads/scraped_data/branches/bau-cat-quan-tan-binh.jpg"
      }
];
    for (const seed of seedBranches) {
      const existing = await this.branchRepository.findOne({ where: { name: seed.name } });
      if (existing) {
        Object.assign(existing, seed);
        await this.branchRepository.save(existing);
      } else {
        await this.branchRepository.save(this.branchRepository.create(seed));
      }
    }
    console.log('🌱 Successfully seeded premium branches!');
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
