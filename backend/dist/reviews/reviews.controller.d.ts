import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ListReviewsQueryDto } from './dto/list-reviews.query';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    list(id: string, query: ListReviewsQueryDto): Promise<{
        data: import("./reviews.service").ReviewDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    create(user: JwtPayload, id: string, dto: CreateReviewDto): Promise<import("./reviews.service").ReviewDto>;
}
export declare class MyReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    update(user: JwtPayload, id: string, dto: UpdateReviewDto): Promise<import("./reviews.service").ReviewDto>;
    remove(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
}
