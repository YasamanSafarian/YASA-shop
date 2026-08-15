"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let AdminReviewsService = class AdminReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = { deleted_at: null };
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
                    name: [review.users.first_name, review.users.last_name]
                        .filter(Boolean)
                        .join(' ') || null,
                    email: review.users.email,
                },
                createdAt: review.created_at.toISOString(),
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async setActive(reviewId, dto) {
        const review = await this.prisma.reviews.findFirst({
            where: { id: reviewId, deleted_at: null },
        });
        if (!review) {
            throw new common_1.NotFoundException('review not found');
        }
        return this.prisma.reviews.update({
            where: { id: reviewId },
            data: { is_active: dto.isActive, updated_at: new Date() },
        });
    }
};
exports.AdminReviewsService = AdminReviewsService;
exports.AdminReviewsService = AdminReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminReviewsService);
//# sourceMappingURL=admin-reviews.service.js.map