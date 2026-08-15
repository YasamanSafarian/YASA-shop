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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProductsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const admin_products_service_1 = require("./admin-products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const create_product_dto_2 = require("./dto/create-product.dto");
const update_variant_dto_1 = require("./dto/update-variant.dto");
const update_stock_dto_1 = require("./dto/update-stock.dto");
const list_admin_products_query_1 = require("./dto/list-admin-products.query");
let AdminProductsController = class AdminProductsController {
    adminProductsService;
    constructor(adminProductsService) {
        this.adminProductsService = adminProductsService;
    }
    list(query) {
        return this.adminProductsService.list(query);
    }
    create(dto) {
        return this.adminProductsService.create(dto);
    }
    update(id, dto) {
        return this.adminProductsService.update(id, dto);
    }
    remove(id) {
        return this.adminProductsService.remove(id);
    }
    addVariant(id, dto) {
        return this.adminProductsService.addVariant(id, dto);
    }
    updateStock(variantId, dto) {
        return this.adminProductsService.updateStock(variantId, dto);
    }
    updateVariant(variantId, dto) {
        return this.adminProductsService.updateVariant(variantId, dto);
    }
    removeVariant(variantId) {
        return this.adminProductsService.removeVariant(variantId);
    }
};
exports.AdminProductsController = AdminProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_admin_products_query_1.ListAdminProductsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/variants'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_product_dto_2.CreateVariantDto]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "addVariant", null);
__decorate([
    (0, common_1.Patch)('variants/:variantId/stock'),
    __param(0, (0, common_1.Param)('variantId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_stock_dto_1.UpdateStockDto]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Patch)('variants/:variantId'),
    __param(0, (0, common_1.Param)('variantId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_variant_dto_1.UpdateVariantDto]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "updateVariant", null);
__decorate([
    (0, common_1.Delete)('variants/:variantId'),
    __param(0, (0, common_1.Param)('variantId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "removeVariant", null);
exports.AdminProductsController = AdminProductsController = __decorate([
    (0, common_1.Controller)('admin/products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [admin_products_service_1.AdminProductsService])
], AdminProductsController);
//# sourceMappingURL=admin-products.controller.js.map