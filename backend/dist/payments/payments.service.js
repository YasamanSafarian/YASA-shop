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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async pay(userId, orderId, dto) {
        const order = await this.prisma.orders.findFirst({
            where: { id: orderId, user_id: userId, deleted_at: null },
        });
        if (!order) {
            throw new common_1.NotFoundException('order not found');
        }
        if (order.order_status === 'cancelled' ||
            order.order_status === 'returned') {
            throw new common_1.BadRequestException('order cannot be paid in its current status');
        }
        const existing = await this.prisma.payments.findFirst({
            where: { order_id: orderId },
        });
        if (existing) {
            throw new common_1.BadRequestException('payment already recorded for this order');
        }
        const payment = await this.prisma.payments.create({
            data: {
                order_id: orderId,
                amount: order.total,
                method: dto.method,
                status: 'pending',
            },
        });
        return this.serialize(payment);
    }
    serialize(payment) {
        return {
            id: payment.id,
            orderId: payment.order_id,
            amount: Number(payment.amount),
            method: payment.method,
            transactionId: payment.transaction_id,
            status: payment.status,
            paidAt: payment.paid_at?.toISOString() ?? null,
            createdAt: payment.created_at.toISOString(),
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map