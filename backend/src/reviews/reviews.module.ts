import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReviewsController, MyReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [AuthModule],
  controllers: [ReviewsController, MyReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
