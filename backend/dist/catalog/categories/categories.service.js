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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async tree() {
        const categories = await this.prisma.categories.findMany({
            where: { deleted_at: null, is_active: true },
            orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
        });
        const nodes = new Map();
        for (const category of categories) {
            nodes.set(category.id, {
                id: category.id,
                name: category.name,
                slug: category.slug,
                imageUrl: category.image_url,
                sortOrder: category.sort_order,
                children: [],
            });
        }
        const roots = [];
        for (const category of categories) {
            const node = nodes.get(category.id);
            if (category.parent_id && nodes.has(category.parent_id)) {
                nodes.get(category.parent_id).children.push(node);
            }
            else {
                roots.push(node);
            }
        }
        return roots;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map