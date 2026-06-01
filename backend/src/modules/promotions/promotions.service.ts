import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepository: Repository<CouponUsage>,
  ) {}

  async createPromotion(dto: {
    name: string;
    type: string;
    discountValue: number;
    discountType: string;
    minOrderValue?: number;
    maxUses?: number;
    startsAt: Date;
    endsAt: Date;
    isActive?: boolean;
  }): Promise<Promotion> {
    const promo = this.promotionRepository.create(dto);
    return this.promotionRepository.save(promo);
  }

  async createCoupon(dto: {
    promotionId: string;
    code: string;
    userId?: string;
    maxUses?: number;
    isActive?: boolean;
    expiresAt?: Date;
  }): Promise<Coupon> {
    // Check if code already exists
    const existing = await this.couponRepository.findOne({ where: { code: dto.code.toUpperCase() } });
    if (existing) {
      throw new BadRequestException(`Coupon code '${dto.code}' already exists`);
    }

    const coupon = this.couponRepository.create({
      ...dto,
      code: dto.code.toUpperCase(),
    });
    return this.couponRepository.save(coupon);
  }

  async validateCoupon(code: string, subtotal: number, userId?: string): Promise<{
    coupon: Coupon;
    discountApplied: number;
  }> {
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase() },
      relations: ['promotion'],
    });

    if (!coupon) {
      throw new NotFoundException(`Mã giảm giá '${code}' không tồn tại`);
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Mã giảm giá này đã bị vô hiệu hóa');
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      throw new BadRequestException('Mã giảm giá đã hết hạn sử dụng');
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Mã giảm giá đã đạt số lượt sử dụng tối đa');
    }

    if (coupon.userId && coupon.userId !== userId) {
      throw new BadRequestException('Mã giảm giá này không áp dụng cho tài khoản của bạn');
    }

    const promo = coupon.promotion;
    if (!promo) {
      throw new BadRequestException('Mã giảm giá không liên kết với chương trình khuyến mãi nào');
    }

    if (!promo.isActive) {
      throw new BadRequestException('Chương trình khuyến mãi đã kết thúc');
    }

    const now = new Date();
    if (now < new Date(promo.startsAt) || now > new Date(promo.endsAt)) {
      throw new BadRequestException('Chương trình khuyến mãi đã hết hạn hoặc chưa bắt đầu');
    }

    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('Chương trình khuyến mãi đã đạt giới hạn sử dụng');
    }

    if (subtotal < Number(promo.minOrderValue)) {
      throw new BadRequestException(
        `Đơn hàng chưa đạt giá trị tối thiểu ${Number(promo.minOrderValue).toLocaleString('vi-VN')}đ để sử dụng mã này`,
      );
    }

    // Calculate discount
    let discountApplied = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discountApplied = subtotal * (Number(promo.discountValue) / 100);
    } else {
      discountApplied = Number(promo.discountValue);
    }

    // Discount cannot exceed subtotal
    if (discountApplied > subtotal) {
      discountApplied = subtotal;
    }

    return {
      coupon,
      discountApplied: Math.round(discountApplied * 100) / 100,
    };
  }

  async useCoupon(couponId: string, orderId: string, userId: string, discountApplied: number): Promise<CouponUsage> {
    const coupon = await this.couponRepository.findOne({ where: { id: couponId }, relations: ['promotion'] });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Increment coupon and promotion used counts
    coupon.usedCount += 1;
    await this.couponRepository.save(coupon);

    if (coupon.promotion) {
      coupon.promotion.usedCount += 1;
      await this.promotionRepository.save(coupon.promotion);
    }

    const usage = this.couponUsageRepository.create({
      couponId,
      orderId,
      userId,
      discountApplied,
    });
    return this.couponUsageRepository.save(usage);
  }
}
