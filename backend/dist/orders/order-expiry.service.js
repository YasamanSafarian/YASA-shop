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
var OrderExpiryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderExpiryService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../database/prisma.service");
const PAYMENT_DEADLINE_MINUTES = 35;
let OrderExpiryService = OrderExpiryService_1 = class OrderExpiryService {
    prisma;
    logger = new common_1.Logger(OrderExpiryService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async cancelExpiredOrders() {
        const deadline = new Date(Date.now() - PAYMENT_DEADLINE_MINUTES * 60 * 1000);
        const expired = await this.prisma.orders.findMany({
            where: {
                order_status: 'pending',
                payment_status: 'pending',
                created_at: { lt: deadline },
                deleted_at: null,
            },
        });
        if (!expired.length)
            return;
        this.logger.warn(`Cancelling ${expired.length} expired order(s) older than ${PAYMENT_DEADLINE_MINUTES}min`);
        for (const order of expired) {
            try {
                await this.prisma.$transaction(async (tx) => {
                    const items = await tx.order_items.findMany({
                        where: { order_id: order.id },
                    });
                    for (const item of items) {
                        await tx.product_variants.updateMany({
                            where: { id: item.variant_id },
                            data: { stock_quantity: { increment: item.quantity } },
                        });
                    }
                    await tx.orders.update({
                        where: { id: order.id },
                        data: {
                            order_status: 'cancelled',
                            payment_status: 'failed',
                            updated_at: new Date(),
                        },
                    });
                    const payments = await tx.payments.findMany({
                        where: { order_id: order.id },
                    });
                    for (const payment of payments) {
                        await tx.payments.update({
                            where: { id: payment.id },
                            data: { status: 'failed', updated_at: new Date() },
                        });
                    }
                    await tx.notifications.create({
                        data: {
                            user_id: order.user_id,
                            type: 'order',
                            title: `Order ${order.order_number} cancelled`,
                            message: `Your order ${order.order_number} was cancelled because payment was not received within ${PAYMENT_DEADLINE_MINUTES} minutes.`,
                        },
                    });
                });
            }
            catch (err) {
                this.logger.error(`Failed to cancel order ${order.order_number}: ${err}`);
            }
        }
    }
};
exports.OrderExpiryService = OrderExpiryService;
__decorate([
    (0, schedule_1.Cron)('*/1 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderExpiryService.prototype, "cancelExpiredOrders", null);
exports.OrderExpiryService = OrderExpiryService = OrderExpiryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderExpiryService);
//# sourceMappingURL=order-expiry.service.js.map