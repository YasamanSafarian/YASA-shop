import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, payments } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListAdminOrdersQueryDto } from './dto/list-admin-orders.query';
import { AdminUpdatePaymentStatusDto } from './dto/update-payment-status.dto';

const adminOrderInclude = {
  order_items: { orderBy: { created_at: 'asc' } },
  users: true,
  payments: { orderBy: { created_at: 'asc' } },
} satisfies Prisma.ordersInclude;

type AdminOrderWithRelations = Prisma.ordersGetPayload<{
  include: typeof adminOrderInclude;
}>;

export interface AdminOrderDto {
  id: string;
  orderNumber: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  address: {
    receiverName: string;
    receiverPhone: string;
    province: string;
    city: string;
    postalCode: string;
    address: string;
  };
  statuses: {
    order: string;
    payment: string;
    shipment: string;
  };
  customerNote: string | null;
  customer: {
    id: string;
    email: string | null;
    phone: string;
    name: string | null;
  };
  payments: {
    id: string;
    amount: number;
    method: string;
    transactionId: string | null;
    status: string;
    paidAt: string | null;
  }[];
  items: {
    id: string;
    variantId: string;
    productName: string;
    productSlug: string;
    sku: string;
    format: string;
    volumeMl: number;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListAdminOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ordersWhereInput = { deleted_at: null };

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

  async findById(orderId: string): Promise<AdminOrderDto> {
    const order = await this.prisma.orders.findFirst({
      where: { id: orderId, deleted_at: null },
      include: adminOrderInclude,
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    return this.serialize(order);
  }

  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<AdminOrderDto> {
    const existing = await this.prisma.orders.findFirst({
      where: { id: orderId, deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundException('order not found');
    }

    if (!dto.orderStatus && !dto.paymentStatus && !dto.shipmentStatus) {
      throw new BadRequestException('nothing to update');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const data: Prisma.ordersUpdateInput = { updated_at: new Date() };

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

      if (
        dto.orderStatus === 'cancelled' &&
        existing.order_status !== 'cancelled'
      ) {
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
      throw new NotFoundException('order not found');
    }

    return this.serialize(order);
  }

  async updatePaymentStatus(
    paymentId: string,
    dto: AdminUpdatePaymentStatusDto,
  ) {
    const payment = await this.prisma.payments.findFirst({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('payment not found');
    }

    if (payment.status === dto.paymentStatus) {
      return this.serializePayment(payment);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.payments.update({
        where: { id: paymentId },
        data: {
          status: dto.paymentStatus,
          paid_at:
            dto.paymentStatus === 'paid'
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

        if (
          (dto.paymentStatus === 'paid' || dto.paymentStatus === 'refunded') &&
          payment.status !== dto.paymentStatus
        ) {
          await tx.notifications.create({
            data: {
              user_id: order.user_id,
              type: 'payment',
              title:
                dto.paymentStatus === 'paid'
                  ? `Payment received for order ${order.order_number}`
                  : `Refund issued for order ${order.order_number}`,
              message:
                dto.paymentStatus === 'paid'
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

  private async syncPaymentsOnCancel(
    tx: Prisma.TransactionClient,
    orderId: string,
  ) {
    const payments = await tx.payments.findMany({
      where: { order_id: orderId },
    });

    let nextStatus: 'refunded' | 'failed' | null = null;

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

  serializePayment(payment: payments) {
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

  serialize(order: AdminOrderWithRelations): AdminOrderDto {
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
        name:
          [customer.first_name, customer.last_name].filter(Boolean).join(' ') ||
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
}
