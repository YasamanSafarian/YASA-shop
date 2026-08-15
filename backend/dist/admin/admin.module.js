"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const admin_orders_controller_1 = require("./admin-orders.controller");
const admin_products_controller_1 = require("./admin-products.controller");
const admin_catalog_controller_1 = require("./admin-catalog.controller");
const admin_payments_controller_1 = require("./admin-payments.controller");
const admin_reviews_controller_1 = require("./admin-reviews.controller");
const admin_orders_service_1 = require("./admin-orders.service");
const admin_products_service_1 = require("./admin-products.service");
const admin_catalog_service_1 = require("./admin-catalog.service");
const admin_reviews_service_1 = require("./admin-reviews.service");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [
            admin_orders_controller_1.AdminOrdersController,
            admin_products_controller_1.AdminProductsController,
            admin_catalog_controller_1.AdminCatalogController,
            admin_payments_controller_1.AdminPaymentsController,
            admin_reviews_controller_1.AdminReviewsController,
        ],
        providers: [
            admin_orders_service_1.AdminOrdersService,
            admin_products_service_1.AdminProductsService,
            admin_catalog_service_1.AdminCatalogService,
            admin_reviews_service_1.AdminReviewsService,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map