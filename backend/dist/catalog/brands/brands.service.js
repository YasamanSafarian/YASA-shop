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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const products_service_1 = require("../products/products.service");
let BrandsService = class BrandsService {
    prisma;
    productsService;
    constructor(prisma, productsService) {
        this.prisma = prisma;
        this.productsService = productsService;
    }
    async list() {
        const [brands, groups] = await Promise.all([
            this.prisma.brands.findMany({
                where: { deleted_at: null, is_active: true },
                orderBy: { name: 'asc' },
            }),
            this.prisma.products.groupBy({
                by: ['brand_id'],
                where: { deleted_at: null, is_active: true },
                _count: { _all: true },
            }),
        ]);
        const counts = new Map(groups.map((group) => [group.brand_id, group._count._all]));
        return brands.map((brand) => ({
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            logoUrl: brand.logo_url,
            productCount: counts.get(brand.id) ?? 0,
        }));
    }
    async findBySlug(slug) {
        const brand = await this.prisma.brands.findFirst({
            where: { slug, deleted_at: null, is_active: true },
        });
        if (!brand) {
            throw new common_1.NotFoundException('brand not found');
        }
        const products = await this.productsService.listByBrand(brand.id);
        return {
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            logoUrl: brand.logo_url,
            products,
        };
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        products_service_1.ProductsService])
], BrandsService);
//# sourceMappingURL=brands.service.js.map