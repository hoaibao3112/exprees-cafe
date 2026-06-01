import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Promotions & Coupons')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

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

  @Public() // Allow public validation of coupons before login or checkout
  @Post('validate-coupon')
  @ApiOperation({ summary: 'Validate a coupon code and calculate discount' })
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
