import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ListReviewsQueryDto } from './dto/list-reviews.query';
declare const reviewInclude: {
    users: true;
};
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
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listByProduct(productId: string, query: ListReviewsQueryDto): Promise<{
        data: ReviewDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    create(userId: string, productId: string, dto: CreateReviewDto): Promise<ReviewDto>;
    update(userId: string, reviewId: string, dto: UpdateReviewDto): Promise<ReviewDto>;
    remove(userId: string, reviewId: string): Promise<{
        message: string;
    }>;
    serialize(review: ReviewWithUser): ReviewDto;
    private findOwned;
}
export {};
