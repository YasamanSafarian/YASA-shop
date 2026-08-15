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
exports.AdminProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const products_service_1 = require("../catalog/products/products.service");
const slugify_1 = require("../common/utils/slugify");
let AdminProductsService = class AdminProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = { deleted_at: null };
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { slug: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [total, products] = await Promise.all([
            this.prisma.products.count({ where }),
            this.prisma.products.findMany({
                where,
                include: {
                    brands: true,
                    _count: { select: { product_variants: true } },
                },
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        return {
            data: products.map((product) => ({
                id: product.id,
                name: product.name,
                slug: product.slug,
                brand: { id: product.brands.id, name: product.brands.name },
                gender: product.gender,
                concentration: product.concentration,
                isActive: product.is_active,
                variantCount: product._count.product_variants,
                createdAt: product.created_at.toISOString(),
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async create(dto) {
        const brand = await this.prisma.brands.findFirst({
            where: { id: dto.brandId, deleted_at: null },
        });
        if (!brand) {
            throw new common_1.NotFoundException('brand not found');
        }
        await this.validateCategories(dto.categoryIds);
        const product = await this.prisma.products.create({
            data: {
                brand_id: dto.brandId,
                name: dto.name,
                slug: await this.uniqueSlug(dto.slug ?? (0, slugify_1.slugify)(dto.name)),
                description: dto.description,
                gender: dto.gender,
                concentration: dto.concentration,
                release_year: dto.releaseYear,
                seasons: dto.seasons ?? [],
                occasions: dto.occasions ?? [],
                is_active: dto.isActive ?? true,
                product_variants: dto.variants?.length
                    ? { create: dto.variants.map((v) => this.mapVariant(v)) }
                    : undefined,
                product_categories: dto.categoryIds?.length
                    ? {
                        create: dto.categoryIds.map((categoryId) => ({
                            category_id: categoryId,
                        })),
                    }
                    : undefined,
            },
            include: products_service_1.productInclude,
        });
        return product;
    }
    async update(id, dto) {
        await this.findProduct(id);
        if (dto.brandId) {
            const brand = await this.prisma.brands.findFirst({
                where: { id: dto.brandId, deleted_at: null },
            });
            if (!brand) {
                throw new common_1.NotFoundException('brand not found');
            }
        }
        const product = await this.prisma.products.update({
            where: { id },
            data: {
                ...(dto.brandId !== undefined && { brand_id: dto.brandId }),
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.slug !== undefined && {
                    slug: await this.uniqueSlug(dto.slug),
                }),
                ...(dto.description !== undefined && {
                    description: dto.description,
                }),
                ...(dto.gender !== undefined && { gender: dto.gender }),
                ...(dto.concentration !== undefined && {
                    concentration: dto.concentration,
                }),
                ...(dto.releaseYear !== undefined && {
                    release_year: dto.releaseYear,
                }),
                ...(dto.seasons !== undefined && { seasons: dto.seasons }),
                ...(dto.occasions !== undefined && { occasions: dto.occasions }),
                ...(dto.isActive !== undefined && { is_active: dto.isActive }),
            },
            include: products_service_1.productInclude,
        });
        return product;
    }
    async remove(id) {
        await this.findProduct(id);
        await this.prisma.$transaction(async (tx) => {
            await tx.product_variants.updateMany({
                where: { product_id: id, deleted_at: null },
                data: { deleted_at: new Date(), is_active: false },
            });
            await tx.products.update({
                where: { id },
                data: { deleted_at: new Date(), is_active: false },
            });
        });
        return { message: 'product deleted' };
    }
    async addVariant(productId, dto) {
        await this.findProduct(productId);
        return this.prisma.product_variants.create({
            data: {
                product_id: productId,
                ...this.mapVariant(dto),
            },
        });
    }
    async updateVariant(variantId, dto) {
        await this.findVariant(variantId);
        return this.prisma.product_variants.update({
            where: { id: variantId },
            data: {
                ...(dto.sku !== undefined && { sku: dto.sku }),
                ...(dto.barcode !== undefined && { barcode: dto.barcode }),
                ...(dto.format !== undefined && { format: dto.format }),
                ...(dto.volumeMl !== undefined && { volume_ml: dto.volumeMl }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.compareAtPrice !== undefined && {
                    compare_at_price: dto.compareAtPrice,
                }),
                ...(dto.stockQuantity !== undefined && {
                    stock_quantity: dto.stockQuantity,
                }),
                ...(dto.weight !== undefined && { weight: dto.weight }),
                ...(dto.isDefault !== undefined && { is_default: dto.isDefault }),
                ...(dto.isActive !== undefined && { is_active: dto.isActive }),
            },
        });
    }
    async removeVariant(variantId) {
        await this.findVariant(variantId);
        await this.prisma.product_variants.update({
            where: { id: variantId },
            data: { deleted_at: new Date(), is_active: false },
        });
        return { message: 'variant deleted' };
    }
    async updateStock(variantId, dto) {
        await this.findVariant(variantId);
        const variant = await this.prisma.product_variants.update({
            where: { id: variantId },
            data: { stock_quantity: dto.stockQuantity },
        });
        return {
            id: variant.id,
            sku: variant.sku,
            stockQuantity: variant.stock_quantity,
        };
    }
    async findProduct(id) {
        const product = await this.prisma.products.findFirst({
            where: { id, deleted_at: null },
        });
        if (!product) {
            throw new common_1.NotFoundException('product not found');
        }
        return product;
    }
    async findVariant(id) {
        const variant = await this.prisma.product_variants.findFirst({
            where: { id, deleted_at: null },
        });
        if (!variant) {
            throw new common_1.NotFoundException('variant not found');
        }
        return variant;
    }
    async validateCategories(categoryIds) {
        if (!categoryIds?.length) {
            return;
        }
        const count = await this.prisma.categories.count({
            where: { id: { in: categoryIds }, deleted_at: null },
        });
        if (count !== categoryIds.length) {
            throw new common_1.BadRequestException('one or more categories not found');
        }
    }
    async uniqueSlug(base, attempt = 0) {
        if (attempt > 20) {
            throw new common_1.BadRequestException('could not generate a unique slug');
        }
        const slug = attempt === 0 ? base : `${base}-${attempt}`;
        const existing = await this.prisma.products.findFirst({
            where: { slug },
            select: { id: true },
        });
        if (existing) {
            return this.uniqueSlug(base, attempt + 1);
        }
        return slug;
    }
    mapVariant(dto) {
        return {
            sku: dto.sku,
            barcode: dto.barcode,
            format: dto.format,
            volume_ml: dto.volumeMl,
            price: dto.price,
            compare_at_price: dto.compareAtPrice,
            stock_quantity: dto.stockQuantity ?? 0,
            weight: dto.weight,
            is_default: dto.isDefault ?? false,
            is_active: dto.isActive ?? true,
        };
    }
};
exports.AdminProductsService = AdminProductsService;
exports.AdminProductsService = AdminProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminProductsService);
//# sourceMappingURL=admin-products.service.js.map