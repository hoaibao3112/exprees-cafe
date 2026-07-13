import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { ContentService } from '../content/content.service';

// POS response types
type PosPromotion = {
  id: string;
  name: string;
  type?: string;
  discountValue?: number;
  discount_value?: number;
  discountType?: string;
  discount_type?: string;
  minOrderValue?: number;
  min_order_value?: number;
  maxUses?: number;
  max_uses?: number;
  usedCount?: number;
  used_count?: number;
  startsAt?: string;
  starts_at?: string;
  endsAt?: string;
  ends_at?: string;
  isActive?: boolean;
  is_active?: boolean;
};

type PosVoucher = {
  id: string;
  code: string;
  discountValue?: number;
  discount_value?: number;
  discountType?: string;
  discount_type?: string;
  minOrderValue?: number;
  min_order_value?: number;
  maxUses?: number;
  max_uses?: number;
  usedCount?: number;
  used_count?: number;
  expiresAt?: string;
  expires_at?: string;
  isActive?: boolean;
  is_active?: boolean;
  userId?: string;
  user_id?: string;
};

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepository: Repository<CouponUsage>,
    private readonly contentService: ContentService,
  ) {}

  // ─── Promotions: POS first, SQLite fallback ─────────────────────────────────

  /**
   * Get all promotions — always tries POS /api/promotions first.
   * Falls back to SQLite only when POS is unreachable.
   */
  async findAllPromotions(): Promise<Promotion[]> {
    try {
      const res = await this.contentService.posFetch<{ success: boolean; data: PosPromotion[] }>(
        'GET',
        '/api/promotions',
      );
      const posItems = res?.data || [];

      // Map POS promotions to local Promotion shape (for unified frontend contract)
      return posItems.map((p) => {
        const promo = new Promotion();
        promo.id = p.id;
        promo.name = p.name;
        promo.type = p.type || 'GENERAL';
        promo.discountValue = Number(p.discountValue ?? p.discount_value ?? 0);
        promo.discountType = p.discountType ?? p.discount_type ?? 'FIXED';
        promo.minOrderValue = Number(p.minOrderValue ?? p.min_order_value ?? 0);
        promo.maxUses = Number(p.maxUses ?? p.max_uses ?? 0);
        promo.usedCount = Number(p.usedCount ?? p.used_count ?? 0);
        promo.isActive = p.isActive ?? p.is_active ?? true;
        promo.startsAt = p.startsAt ?? p.starts_at ? new Date(p.startsAt ?? p.starts_at!) : new Date();
        promo.endsAt = p.endsAt ?? p.ends_at ? new Date(p.endsAt ?? p.ends_at!) : new Date();
        return promo;
      });
    } catch (err) {
      console.error('POS /api/promotions unavailable, falling back to SQLite:', err);
    }

    // SQLite fallback
    return this.promotionRepository.find({ where: { isActive: true } });
  }

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

  // ─── Coupons/Vouchers: POS first, SQLite fallback ───────────────────────────

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

  /**
   * Validate a coupon/voucher code.
   * Priority: POS /api/vouchers first → SQLite fallback only when POS unreachable.
   */
  async validateCoupon(
    code: string,
    subtotal: number,
    userId?: string,
  ): Promise<{
    coupon: Coupon;
    discountApplied: number;
  }> {
    // 1. Try POS /api/vouchers first
    try {
      const res = await this.contentService.posFetch<{ success: boolean; data: PosVoucher[] }>(
        'GET',
        '/api/vouchers',
      );
      const posVouchers = res?.data || [];
      const posVoucher = posVouchers.find((v) => v.code?.toUpperCase() === code.toUpperCase());

      if (posVoucher) {
        return this.validatePosVoucher(posVoucher, subtotal, userId);
      }

      // POS call succeeded but voucher not found in POS → don't fall back to SQLite
      throw new NotFoundException(`Mã giảm giá '${code}' không tồn tại`);
    } catch (err) {
      // Only fall back to SQLite if POS is unreachable (network/server error)
      if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
      console.error('POS /api/vouchers unavailable, falling back to SQLite coupon validation:', err);
    }

    // 2. SQLite fallback (only when POS server is down)
    return this.validateSqliteCoupon(code, subtotal, userId);
  }

  private validatePosVoucher(
    posVoucher: PosVoucher,
    subtotal: number,
    userId?: string,
  ): { coupon: Coupon; discountApplied: number } {
    const isActive = posVoucher.isActive ?? posVoucher.is_active ?? true;
    if (!isActive) {
      throw new BadRequestException('Mã giảm giá này đã bị vô hiệu hóa');
    }

    const expiresAt = posVoucher.expiresAt ?? posVoucher.expires_at;
    if (expiresAt && new Date() > new Date(expiresAt)) {
      throw new BadRequestException('Mã giảm giá đã hết hạn sử dụng');
    }

    const maxUses = Number(posVoucher.maxUses ?? posVoucher.max_uses ?? 0);
    const usedCount = Number(posVoucher.usedCount ?? posVoucher.used_count ?? 0);
    if (maxUses > 0 && usedCount >= maxUses) {
      throw new BadRequestException('Mã giảm giá đã đạt số lượt sử dụng tối đa');
    }

    const voucherUserId = posVoucher.userId ?? posVoucher.user_id;
    if (voucherUserId && voucherUserId !== userId) {
      throw new BadRequestException('Mã giảm giá này không áp dụng cho tài khoản của bạn');
    }

    const minOrderValue = Number(posVoucher.minOrderValue ?? posVoucher.min_order_value ?? 0);
    if (subtotal < minOrderValue) {
      throw new BadRequestException(
        `Đơn hàng chưa đạt giá trị tối thiểu ${minOrderValue.toLocaleString('vi-VN')}đ để sử dụng mã này`,
      );
    }

    const discountValue = Number(posVoucher.discountValue ?? posVoucher.discount_value ?? 0);
    const discountType = (posVoucher.discountType ?? posVoucher.discount_type ?? 'FIXED').toUpperCase();

    let discountApplied = 0;
    if (discountType === 'PERCENTAGE') {
      discountApplied = subtotal * (discountValue / 100);
    } else {
      discountApplied = discountValue;
    }
    if (discountApplied > subtotal) discountApplied = subtotal;

    // Build a Coupon-shaped object for unified response contract
    const coupon = new Coupon();
    coupon.id = posVoucher.id;
    coupon.code = posVoucher.code.toUpperCase();
    coupon.isActive = isActive;
    coupon.maxUses = maxUses;
    coupon.usedCount = usedCount;
    coupon.expiresAt = expiresAt ? new Date(expiresAt) : (null as any);

    return {
      coupon,
      discountApplied: Math.round(discountApplied * 100) / 100,
    };
  }

  private async validateSqliteCoupon(
    code: string,
    subtotal: number,
    userId?: string,
  ): Promise<{ coupon: Coupon; discountApplied: number }> {
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

    let discountApplied = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discountApplied = subtotal * (Number(promo.discountValue) / 100);
    } else {
      discountApplied = Number(promo.discountValue);
    }
    if (discountApplied > subtotal) discountApplied = subtotal;

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
