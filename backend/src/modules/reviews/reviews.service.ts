import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async submitReview(
    userId: string,
    dto: {
      targetType: string; // PRODUCT, BRANCH
      targetId: string;
      rating: number;
      comment: string;
    },
  ): Promise<Review> {
    if (dto.rating < 1 || dto.rating > 5) {
      throw new ForbiddenException('Xếp hạng đánh giá phải từ 1 đến 5 sao');
    }

    let isVerifiedPurchase = false;
    let orderId: string | undefined = undefined;

    if (dto.targetType === 'PRODUCT') {
      // Query to check if the user has a COMPLETED order containing a variant belonging to targetId (productId)
      const matchingOrder = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoinAndSelect('order.items', 'item')
        .innerJoinAndSelect('item.variant', 'variant')
        .where('order.user_id = :userId', { userId })
        .andWhere('order.status = :status', { status: 'COMPLETED' })
        .andWhere('variant.product_id = :productId', { productId: dto.targetId })
        .getOne();

      if (!matchingOrder) {
        throw new ForbiddenException(
          'Đánh giá thất bại! Chỉ những khách hàng đã từng mua và hoàn tất đơn hàng đối với sản phẩm này mới có quyền đánh giá sản phẩm.',
        );
      }
      isVerifiedPurchase = true;
      orderId = matchingOrder.id;
    } else if (dto.targetType === 'BRANCH') {
      // For branches, check if they have ordered from it for verified purchase badge
      const matchingOrder = await this.orderRepository.findOne({
        where: {
          userId,
          branchId: dto.targetId,
          status: 'COMPLETED',
        },
      });
      if (matchingOrder) {
        isVerifiedPurchase = true;
        orderId = matchingOrder.id;
      }
    }

    const review = this.reviewRepository.create({
      userId,
      orderId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      rating: dto.rating,
      comment: dto.comment,
      isVerifiedPurchase,
      status: 'APPROVED', // Auto-approved in this dev sandbox
    });

    return this.reviewRepository.save(review);
  }

  async getReviewsForTarget(targetType: string, targetId: string): Promise<{
    reviews: Review[];
    stats: {
      averageRating: number;
      totalCount: number;
      starDistribution: Record<number, number>;
    };
  }> {
    const reviews = await this.reviewRepository.find({
      where: { targetType, targetId, status: 'APPROVED' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    const totalCount = reviews.length;
    let sumRating = 0;
    const starDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((r) => {
      sumRating += r.rating;
      if (starDistribution[r.rating] !== undefined) {
        starDistribution[r.rating] += 1;
      }
    });

    const averageRating = totalCount > 0 ? Math.round((sumRating / totalCount) * 10) / 10 : 0;

    return {
      reviews,
      stats: {
        averageRating,
        totalCount,
        starDistribution,
      },
    };
  }

  async moderateReview(id: string, status: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    review.status = status;
    return this.reviewRepository.save(review);
  }
}
