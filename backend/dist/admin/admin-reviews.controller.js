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
exports.AdminReviewsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const admin_reviews_service_1 = require("./admin-reviews.service");
const list_admin_reviews_query_1 = require("./dto/list-admin-reviews.query");
const update_review_active_dto_1 = require("./dto/update-review-active.dto");
let AdminReviewsController = class AdminReviewsController {
    adminReviewsService;
    constructor(adminReviewsService) {
        this.adminReviewsService = adminReviewsService;
    }
    list(query) {
        return this.adminReviewsService.list(query);
    }
    setActive(id, dto) {
        return this.adminReviewsService.setActive(id, dto);
    }
};
exports.AdminReviewsController = AdminReviewsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_admin_reviews_query_1.ListAdminReviewsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminReviewsController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_review_active_dto_1.UpdateReviewActiveDto]),
    __metadata("design:returntype", void 0)
], AdminReviewsController.prototype, "setActive", null);
exports.AdminReviewsController = AdminReviewsController = __decorate([
    (0, common_1.Controller)('admin/reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [admin_reviews_service_1.AdminReviewsService])
], AdminReviewsController);
//# sourceMappingURL=admin-reviews.controller.js.map