import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ListReviewsQueryDto } from './dto/list-reviews.query';

const reviewInclude = { users: true } satisfies Prisma.reviewsInclude;

type ReviewWithUser = Prisma.reviewsGetPayload<{
  include: typeof reviewInclude;
}>;

export interface ReviewDto {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isActive: boolean;
  reviewer: {
    name: string | null;
    email: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByProduct(productId: string, query: ListReviewsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.reviewsWhereInput = {
      product_id: productId,
      is_active: true,
      deleted_at: null,
    };

    const [total, reviews] = await Promise.all([
      this.prisma.reviews.count({ where }),
      this.prisma.reviews.findMany({
        where,
        include: reviewInclude,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: reviews.map((review) => this.serialize(review)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(
    userId: string,
    productId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewDto> {
    const product = await this.prisma.products.findFirst({
      where: { id: productId, deleted_at: null, is_active: true },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('product not found');
    }

    const existing = await this.prisma.reviews.findFirst({
      where: { user_id: userId, product_id: productId },
    });

    if (existing) {
      if (existing.deleted_at === null) {
        throw new ConflictException('you have already reviewed this product');
      }

      const restored = await this.prisma.reviews.update({
        where: { id: existing.id },
        data: {
          deleted_at: null,
          is_active: true,
          rating: dto.rating,
          title: dto.title,
          comment: dto.comment,
          updated_at: new Date(),
        },
        include: reviewInclude,
      });

      return this.serialize(restored);
    }

    const review = await this.prisma.reviews.create({
      data: {
        user_id: userId,
        product_id: productId,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
      },
      include: reviewInclude,
    });

    return this.serialize(review);
  }

  async update(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewDto> {
    await this.findOwned(userId, reviewId);

    const review = await this.prisma.reviews.update({
      where: { id: reviewId },
      data: {
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.comment !== undefined && { comment: dto.comment }),
        updated_at: new Date(),
      },
      include: reviewInclude,
    });

    return this.serialize(review);
  }

  async remove(userId: string, reviewId: string): Promise<{ message: string }> {
    await this.findOwned(userId, reviewId);

    await this.prisma.reviews.update({
      where: { id: reviewId },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });

    return { message: 'review deleted' };
  }

  serialize(review: ReviewWithUser): ReviewDto {
    const user = review.users;

    return {
      id: review.id,
      productId: review.product_id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isActive: review.is_active,
      reviewer: {
        name:
          [user.first_name, user.last_name].filter(Boolean).join(' ') || null,
        email: user.email,
      },
      createdAt: review.created_at.toISOString(),
      updatedAt: review.updated_at.toISOString(),
    };
  }

  private async findOwned(userId: string, reviewId: string) {
    const review = await this.prisma.reviews.findFirst({
      where: { id: reviewId, user_id: userId, deleted_at: null },
    });

    if (!review) {
      throw new NotFoundException('review not found');
    }

    return review;
  }
}
