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
exports.WishlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const products_service_1 = require("../catalog/products/products.service");
let WishlistService = class WishlistService {
    prisma;
    productsService;
    constructor(prisma, productsService) {
        this.prisma = prisma;
        this.productsService = productsService;
    }
    async list(userId) {
        const rows = await this.prisma.wishlists.findMany({
            where: { user_id: userId },
            include: {
                products: { include: products_service_1.productInclude },
            },
            orderBy: { created_at: 'desc' },
        });
        return rows.map((row) => this.productsService.serialize(row.products));
    }
    async add(userId, productId) {
        const product = await this.prisma.products.findFirst({
            where: { id: productId, deleted_at: null, is_active: true },
            select: { id: true },
        });
        if (!product) {
            throw new common_1.NotFoundException('product not found');
        }
        const existing = await this.prisma.wishlists.findFirst({
            where: { user_id: userId, product_id: productId },
        });
        if (existing) {
            throw new common_1.ConflictException('product is already in your wishlist');
        }
        await this.prisma.wishlists.create({
            data: { user_id: userId, product_id: productId },
        });
        return { message: 'added to wishlist' };
    }
    async remove(userId, productId) {
        const existing = await this.prisma.wishlists.findFirst({
            where: { user_id: userId, product_id: productId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('product not found in wishlist');
        }
        await this.prisma.wishlists.delete({ where: { id: existing.id } });
        return { message: 'removed from wishlist' };
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        products_service_1.ProductsService])
], WishlistService);
//# sourceMappingURL=wishlist.service.js.map