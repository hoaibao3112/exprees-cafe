import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, Coupon, CouponUsage]), ContentModule],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [TypeOrmModule, PromotionsService],
})
export class PromotionsModule {}

