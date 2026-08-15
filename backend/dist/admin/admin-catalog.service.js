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
exports.AdminCatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const slugify_1 = require("../common/utils/slugify");
let AdminCatalogService = class AdminCatalogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBrand(dto) {
        return this.prisma.brands.create({
            data: {
                name: dto.name,
                slug: dto.slug ?? (0, slugify_1.slugify)(dto.name),
                logo_url: dto.logoUrl,
                is_active: dto.isActive ?? true,
            },
        });
    }
    async updateBrand(id, dto) {
        await this.findBrand(id);
        return this.prisma.brands.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.slug !== undefined && { slug: dto.slug }),
                ...(dto.logoUrl !== undefined && { logo_url: dto.logoUrl }),
                ...(dto.isActive !== undefined && { is_active: dto.isActive }),
            },
        });
    }
    async removeBrand(id) {
        await this.findBrand(id);
        await this.prisma.$transaction(async (tx) => {
            await tx.products.updateMany({
                where: { brand_id: id, deleted_at: null },
                data: { deleted_at: new Date(), is_active: false },
            });
            await tx.brands.update({
                where: { id },
                data: { deleted_at: new Date(), is_active: false },
            });
        });
        return { message: 'brand deleted' };
    }
    async createCategory(dto) {
        if (dto.parentId) {
            await this.findCategory(dto.parentId);
        }
        return this.prisma.categories.create({
            data: {
                name: dto.name,
                slug: dto.slug ?? (0, slugify_1.slugify)(dto.name),
                parent_id: dto.parentId,
                image_url: dto.imageUrl,
                sort_order: dto.sortOrder ?? 0,
                is_active: dto.isActive ?? true,
            },
        });
    }
    async updateCategory(id, dto) {
        await this.findCategory(id);
        if (dto.parentId) {
            await this.findCategory(dto.parentId);
        }
        return this.prisma.categories.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.slug !== undefined && { slug: dto.slug }),
                ...(dto.parentId !== undefined && { parent_id: dto.parentId }),
                ...(dto.imageUrl !== undefined && { image_url: dto.imageUrl }),
                ...(dto.sortOrder !== undefined && { sort_order: dto.sortOrder }),
                ...(dto.isActive !== undefined && { is_active: dto.isActive }),
            },
        });
    }
    async removeCategory(id) {
        await this.findCategory(id);
        await this.prisma.$transaction(async (tx) => {
            await tx.categories.updateMany({
                where: { parent_id: id, deleted_at: null },
                data: { deleted_at: new Date(), is_active: false },
            });
            await tx.categories.update({
                where: { id },
                data: { deleted_at: new Date(), is_active: false },
            });
        });
        return { message: 'category deleted' };
    }
    async findBrand(id) {
        const brand = await this.prisma.brands.findFirst({
            where: { id, deleted_at: null },
        });
        if (!brand) {
            throw new common_1.NotFoundException('brand not found');
        }
        return brand;
    }
    async findCategory(id) {
        const category = await this.prisma.categories.findFirst({
            where: { id, deleted_at: null },
        });
        if (!category) {
            throw new common_1.NotFoundException('category not found');
        }
        return category;
    }
};
exports.AdminCatalogService = AdminCatalogService;
exports.AdminCatalogService = AdminCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminCatalogService);
//# sourceMappingURL=admin-catalog.service.js.map