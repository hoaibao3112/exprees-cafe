import { Controller, Post, Get, Patch, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reviews & Ratings')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Submit a new review (Authenticated - Verified purchase check)' })
  submit(
    @CurrentUser('id') userId: string,
    @Body()
    dto: {
      targetType: string; // PRODUCT, BRANCH
      targetId: string;
      rating: number;
      comment: string;
    },
  ) {
    return this.reviewsService.submitReview(userId, dto);
  }

  @Public()
  @Get(':targetType/:targetId')
  @ApiOperation({ summary: 'Get reviews and score stats for product or branch' })
  getTargetReviews(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.reviewsService.getReviewsForTarget(targetType, targetId);
  }

  @Patch('admin/:id/status')
  @ApiOperation({ summary: 'Moderate review status (Admin)' })
  moderate(
    @Param('id') id: string,
    @Body('status') status: string, // APPROVED, SPAM
  ) {
    return this.reviewsService.moderateReview(id, status);
  }
}
