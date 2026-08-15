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
exports.UpdateOrderStatusDto = void 0;
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class UpdateOrderStatusDto {
    orderStatus;
    paymentStatus;
    shipmentStatus;
}
exports.UpdateOrderStatusDto = UpdateOrderStatusDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.order_status_enum, {
        message: 'orderStatus must be one of: pending, paid, packing, shipped, delivered, cancelled, returned',
    }),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "orderStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.payment_status_enum, {
        message: 'paymentStatus must be one of: pending, paid, failed, refunded',
    }),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.shipment_status_enum, {
        message: 'shipmentStatus must be one of: pending, ready, sent, delivered, returned',
    }),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "shipmentStatus", void 0);
//# sourceMappingURL=update-order-status.dto.js.map