import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ListAdminReviewsQueryDto } from './dto/list-admin-reviews.query';
import { UpdateReviewActiveDto } from './dto/update-review-active.dto';

@Injectable()
export class AdminReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListAdminReviewsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.reviewsWhereInput = { deleted_at: null };

    const [total, reviews] = await Promise.all([
      this.prisma.reviews.count({ where }),
      this.prisma.reviews.findMany({
        where,
        include: {
          users: true,
          products: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: reviews.map((review) => ({
        id: review.id,
        product: review.products,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isActive: review.is_active,
        reviewer: {
          name:
            [review.users.first_name, review.users.last_name]
              .filter(Boolean)
              .join(' ') || null,
          email: review.users.email,
        },
        createdAt: review.created_at.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async setActive(reviewId: string, dto: UpdateReviewActiveDto) {
    const review = await this.prisma.reviews.findFirst({
      where: { id: reviewId, deleted_at: null },
    });

    if (!review) {
      throw new NotFoundException('review not found');
    }

    return this.prisma.reviews.update({
      where: { id: reviewId },
      data: { is_active: dto.isActive, updated_at: new Date() },
    });
  }
}
