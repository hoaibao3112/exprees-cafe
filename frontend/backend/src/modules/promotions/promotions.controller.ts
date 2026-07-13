import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Promotions & Coupons')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active promotions (from POS, SQLite fallback)' })
  findAllPromotions() {
    return this.promotionsService.findAllPromotions();
  }

  @Post('admin/create-promotion')
  @ApiOperation({ summary: 'Create a new promotion (Admin)' })
  createPromotion(
    @Body()
    dto: {
      name: string;
      type: string;
      discountValue: number;
      discountType: string;
      minOrderValue?: number;
      maxUses?: number;
      startsAt: Date;
      endsAt: Date;
      isActive?: boolean;
    },
  ) {
    return this.promotionsService.createPromotion(dto);
  }

  @Post('admin/create-coupon')
  @ApiOperation({ summary: 'Create a new coupon code (Admin)' })
  createCoupon(
    @Body()
    dto: {
      promotionId: string;
      code: string;
      userId?: string;
      maxUses?: number;
      isActive?: boolean;
      expiresAt?: Date;
    },
  ) {
    return this.promotionsService.createCoupon(dto);
  }

  @Public()
  @Post('validate-coupon')
  @ApiOperation({ summary: 'Validate a coupon code and calculate discount (POS first, SQLite fallback)' })
  async validateCoupon(
    @Body()
    dto: {
      code: string;
      subtotal: number;
      userId?: string;
    },
  ) {
    const result = await this.promotionsService.validateCoupon(dto.code, Number(dto.subtotal), dto.userId);
    return {
      success: true,
      couponId: result.coupon.id,
      code: result.coupon.code,
      discountApplied: result.discountApplied,
      message: 'Mã giảm giá được áp dụng thành công',
    };
  }
}
