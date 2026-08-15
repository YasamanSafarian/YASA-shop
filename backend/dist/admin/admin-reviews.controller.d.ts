import { AdminReviewsService } from './admin-reviews.service';
import { ListAdminReviewsQueryDto } from './dto/list-admin-reviews.query';
import { UpdateReviewActiveDto } from './dto/update-review-active.dto';
export declare class AdminReviewsController {
    private readonly adminReviewsService;
    constructor(adminReviewsService: AdminReviewsService);
    list(query: ListAdminReviewsQueryDto): Promise<{
        data: {
            id: string;
            product: {
                name: string;
                id: string;
                slug: string;
            };
            rating: number;
            title: string | null;
            comment: string | null;
            isActive: boolean;
            reviewer: {
                name: string | null;
                email: string | null;
            };
            createdAt: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    setActive(id: string, dto: UpdateReviewActiveDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        user_id: string;
        product_id: string;
        title: string | null;
        rating: number;
        comment: string | null;
    }>;
}
