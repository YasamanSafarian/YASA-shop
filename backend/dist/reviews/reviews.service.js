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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const reviewInclude = { users: true };
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listByProduct(productId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
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
    async create(userId, productId, dto) {
        const product = await this.prisma.products.findFirst({
            where: { id: productId, deleted_at: null, is_active: true },
            select: { id: true },
        });
        if (!product) {
            throw new common_1.NotFoundException('product not found');
        }
        const existing = await this.prisma.reviews.findFirst({
            where: { user_id: userId, product_id: productId },
        });
        if (existing) {
            if (existing.deleted_at === null) {
                throw new common_1.ConflictException('you have already reviewed this product');
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
    async update(userId, reviewId, dto) {
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
    async remove(userId, reviewId) {
        await this.findOwned(userId, reviewId);
        await this.prisma.reviews.update({
            where: { id: reviewId },
            data: { deleted_at: new Date(), updated_at: new Date() },
        });
        return { message: 'review deleted' };
    }
    serialize(review) {
        const user = review.users;
        return {
            id: review.id,
            productId: review.product_id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            isActive: review.is_active,
            reviewer: {
                name: [user.first_name, user.last_name].filter(Boolean).join(' ') || null,
                email: user.email,
            },
            createdAt: review.created_at.toISOString(),
            updatedAt: review.updated_at.toISOString(),
        };
    }
    async findOwned(userId, reviewId) {
        const review = await this.prisma.reviews.findFirst({
            where: { id: reviewId, user_id: userId, deleted_at: null },
        });
        if (!review) {
            throw new common_1.NotFoundException('review not found');
        }
        return review;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map