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
exports.AdminOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const adminOrderInclude = {
    order_items: { orderBy: { created_at: 'asc' } },
    users: true,
    payments: { orderBy: { created_at: 'asc' } },
};
let AdminOrdersService = class AdminOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = { deleted_at: null };
        if (query.orderStatus) {
            where.order_status = query.orderStatus;
        }
        if (query.paymentStatus) {
            where.payment_status = query.paymentStatus;
        }
        if (query.shipmentStatus) {
            where.shipment_status = query.shipmentStatus;
        }
        const [total, orders] = await Promise.all([
            this.prisma.orders.count({ where }),
            this.prisma.orders.findMany({
                where,
                include: adminOrderInclude,
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        return {
            data: orders.map((order) => this.serialize(order)),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(orderId) {
        const order = await this.prisma.orders.findFirst({
            where: { id: orderId, deleted_at: null },
            include: adminOrderInclude,
        });
        if (!order) {
            throw new common_1.NotFoundException('order not found');
        }
        return this.serialize(order);
    }
    async updateStatus(orderId, dto) {
        const existing = await this.prisma.orders.findFirst({
            where: { id: orderId, deleted_at: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException('order not found');
        }
        if (!dto.orderStatus && !dto.paymentStatus && !dto.shipmentStatus) {
            throw new common_1.BadRequestException('nothing to update');
        }
        const order = await this.prisma.$transaction(async (tx) => {
            const data = { updated_at: new Date() };
            if (dto.orderStatus) {
                data.order_status = dto.orderStatus;
            }
            if (dto.paymentStatus) {
                data.payment_status = dto.paymentStatus;
            }
            if (dto.shipmentStatus) {
                data.shipment_status = dto.shipmentStatus;
            }
            await tx.orders.update({ where: { id: orderId }, data });
            if (dto.orderStatus && dto.orderStatus !== existing.order_status) {
                await tx.notifications.create({
                    data: {
                        user_id: existing.user_id,
                        type: 'order',
                        title: `Order ${existing.order_number} updated`,
                        message: `Your order ${existing.order_number} is now ${dto.orderStatus}.`,
                    },
                });
            }
            if (dto.orderStatus === 'cancelled' &&
                existing.order_status !== 'cancelled') {
                const items = await tx.order_items.findMany({
                    where: { order_id: orderId },
                });
                for (const item of items) {
                    await tx.product_variants.updateMany({
                        where: { id: item.variant_id },
                        data: { stock_quantity: { increment: item.quantity } },
                    });
                }
                await this.syncPaymentsOnCancel(tx, orderId);
            }
            return tx.orders.findFirst({
                where: { id: orderId },
                include: adminOrderInclude,
            });
        });
        if (!order) {
            throw new common_1.NotFoundException('order not found');
        }
        return this.serialize(order);
    }
    async updatePaymentStatus(paymentId, dto) {
        const payment = await this.prisma.payments.findFirst({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('payment not found');
        }
        if (payment.status === dto.paymentStatus) {
            return this.serializePayment(payment);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const result = await tx.payments.update({
                where: { id: paymentId },
                data: {
                    status: dto.paymentStatus,
                    paid_at: dto.paymentStatus === 'paid'
                        ? new Date()
                        : dto.paymentStatus === 'failed'
                            ? null
                            : payment.paid_at,
                    updated_at: new Date(),
                },
            });
            const order = await tx.orders.findFirst({
                where: { id: payment.order_id },
            });
            if (order) {
                await tx.orders.update({
                    where: { id: order.id },
                    data: {
                        payment_status: dto.paymentStatus,
                        ...(dto.paymentStatus === 'paid' && order.order_status === 'pending'
                            ? { order_status: 'paid' }
                            : {}),
                        updated_at: new Date(),
                    },
                });
                if ((dto.paymentStatus === 'paid' || dto.paymentStatus === 'refunded') &&
                    payment.status !== dto.paymentStatus) {
                    await tx.notifications.create({
                        data: {
                            user_id: order.user_id,
                            type: 'payment',
                            title: dto.paymentStatus === 'paid'
                                ? `Payment received for order ${order.order_number}`
                                : `Refund issued for order ${order.order_number}`,
                            message: dto.paymentStatus === 'paid'
                                ? `Your payment of ${Number(payment.amount)} for order ${order.order_number} has been received.`
                                : `Your payment for order ${order.order_number} has been refunded.`,
                        },
                    });
                }
            }
            return result;
        });
        return this.serializePayment(updated);
    }
    async syncPaymentsOnCancel(tx, orderId) {
        const payments = await tx.payments.findMany({
            where: { order_id: orderId },
        });
        let nextStatus = null;
        for (const payment of payments) {
            const status = payment.status === 'paid' ? 'refunded' : 'failed';
            await tx.payments.update({
                where: { id: payment.id },
                data: { status, updated_at: new Date() },
            });
            nextStatus = status;
        }
        if (nextStatus) {
            await tx.orders.update({
                where: { id: orderId },
                data: { payment_status: nextStatus },
            });
        }
    }
    serializePayment(payment) {
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
    serialize(order) {
        const customer = order.users;
        return {
            id: order.id,
            orderNumber: order.order_number,
            subtotal: Number(order.subtotal),
            discountAmount: Number(order.discount_amount),
            shippingFee: Number(order.shipping_fee),
            total: Number(order.total),
            address: {
                receiverName: order.receiver_name,
                receiverPhone: order.receiver_phone,
                province: order.province,
                city: order.city,
                postalCode: order.postal_code,
                address: order.address,
            },
            statuses: {
                order: order.order_status,
                payment: order.payment_status,
                shipment: order.shipment_status,
            },
            customerNote: order.customer_note,
            customer: {
                id: customer.id,
                email: customer.email,
                phone: customer.phone,
                name: [customer.first_name, customer.last_name].filter(Boolean).join(' ') ||
                    null,
            },
            items: order.order_items.map((item) => ({
                id: item.id,
                variantId: item.variant_id,
                productName: item.product_name,
                productSlug: item.product_slug,
                sku: item.sku,
                format: item.format,
                volumeMl: item.volume_ml,
                unitPrice: Number(item.unit_price),
                quantity: item.quantity,
                lineTotal: Number(item.line_total),
            })),
            payments: order.payments.map((payment) => ({
                id: payment.id,
                amount: Number(payment.amount),
                method: payment.method,
                transactionId: payment.transaction_id,
                status: payment.status,
                paidAt: payment.paid_at?.toISOString() ?? null,
            })),
            createdAt: order.created_at.toISOString(),
            updatedAt: order.updated_at.toISOString(),
        };
    }
};
exports.AdminOrdersService = AdminOrdersService;
exports.AdminOrdersService = AdminOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminOrdersService);
//# sourceMappingURL=admin-orders.service.js.map