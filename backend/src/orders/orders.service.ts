import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders.query';

const orderInclude = {
  order_items: { orderBy: { created_at: 'asc' } },
  payments: { orderBy: { created_at: 'asc' } },
} satisfies Prisma.ordersInclude;

type OrderWithRelations = Prisma.ordersGetPayload<{
  include: typeof orderInclude;
}>;

export interface OrderItemDto {
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
}

export interface OrderDto {
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
  items: OrderItemDto[];
  payments: {
    id: string;
    amount: number;
    method: string;
    transactionId: string | null;
    status: string;
    paidAt: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrders {
  data: OrderDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto): Promise<OrderDto> {
    const address = await this.resolveAddress(userId, dto.addressId);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const order = await this.prisma.$transaction(async (tx) => {
          const cart = await tx.carts.findFirst({
            where: { user_id: userId, deleted_at: null },
            include: {
              cart_items: {
                where: { deleted_at: null },
                include: { product_variants: { include: { products: true } } },
              },
            },
          });

          if (!cart || cart.cart_items.length === 0) {
            throw new BadRequestException('cart is empty');
          }

          let subtotal = 0;
          for (const item of cart.cart_items) {
            const variant = item.product_variants;

            if (variant.deleted_at !== null || !variant.is_active) {
              throw new BadRequestException(
                `${variant.sku} is no longer available`,
              );
            }

            if (variant.stock_quantity < item.quantity) {
              throw new BadRequestException(
                `insufficient stock: only ${variant.stock_quantity} of ${variant.sku} available`,
              );
            }

            subtotal += Number(variant.price) * item.quantity;
          }

          const discountAmount = 0;
          const shippingFee = 0;
          const total = subtotal + shippingFee - discountAmount;

          for (const item of cart.cart_items) {
            const result = await tx.product_variants.updateMany({
              where: {
                id: item.variant_id,
                stock_quantity: { gte: item.quantity },
              },
              data: { stock_quantity: { decrement: item.quantity } },
            });

            if (result.count === 0) {
              throw new BadRequestException(
                `insufficient stock: only ${item.product_variants.stock_quantity} of ${item.product_variants.sku} available`,
              );
            }
          }

          const order = await tx.orders.create({
            data: {
              user_id: userId,
              order_number: this.generateOrderNumber(),
              subtotal,
              discount_amount: discountAmount,
              shipping_fee: shippingFee,
              total,
              receiver_name: address.receiver_name,
              receiver_phone: address.receiver_phone,
              province: address.province,
              city: address.city,
              postal_code: address.postal_code,
              address: address.address,
              customer_note: dto.note ?? null,
              order_items: {
                create: cart.cart_items.map((item) => {
                  const unitPrice = Number(item.product_variants.price);
                  return {
                    variant_id: item.variant_id,
                    product_name: item.product_variants.products.name,
                    product_slug: item.product_variants.products.slug,
                    sku: item.product_variants.sku,
                    format: item.product_variants.format,
                    volume_ml: item.product_variants.volume_ml,
                    unit_price: unitPrice,
                    quantity: item.quantity,
                    line_total: unitPrice * item.quantity,
                  };
                }),
              },
            },
            include: orderInclude,
          });

          await tx.cart_items.updateMany({
            where: { cart_id: cart.id, deleted_at: null },
            data: { deleted_at: new Date(), updated_at: new Date() },
          });
          await tx.carts.update({
            where: { id: cart.id },
            data: { deleted_at: new Date(), updated_at: new Date() },
          });

          return order;
        });

        return this.serialize(order);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new BadRequestException('could not place order, please retry');
  }

  async list(
    userId: string,
    query: ListOrdersQueryDto,
  ): Promise<PaginatedOrders> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ordersWhereInput = {
      user_id: userId,
      deleted_at: null,
    };

    const [total, orders] = await Promise.all([
      this.prisma.orders.count({ where }),
      this.prisma.orders.findMany({
        where,
        include: orderInclude,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: orders.map((order) => this.serialize(order)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(userId: string, orderId: string): Promise<OrderDto> {
    const order = await this.prisma.orders.findFirst({
      where: { id: orderId, user_id: userId, deleted_at: null },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    return this.serialize(order);
  }

  async cancel(userId: string, orderId: string): Promise<OrderDto> {
    const existing = await this.prisma.orders.findFirst({
      where: { id: orderId, user_id: userId, deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundException('order not found');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const result = await tx.orders.updateMany({
        where: { id: orderId, order_status: { in: ['pending', 'paid'] } },
        data: { order_status: 'cancelled', updated_at: new Date() },
      });

      if (result.count === 0) {
        throw new BadRequestException(
          'order cannot be cancelled in its current status',
        );
      }

      const items = await tx.order_items.findMany({
        where: { order_id: orderId },
      });

      for (const item of items) {
        await tx.product_variants.updateMany({
          where: { id: item.variant_id },
          data: { stock_quantity: { increment: item.quantity } },
        });
      }

      const payments = await tx.payments.findMany({
        where: { order_id: orderId },
      });

      let paymentStatus: 'refunded' | 'failed' | null = null;
      for (const payment of payments) {
        const status = payment.status === 'paid' ? 'refunded' : 'failed';
        await tx.payments.update({
          where: { id: payment.id },
          data: { status, updated_at: new Date() },
        });
        paymentStatus = status;
      }

      if (paymentStatus) {
        await tx.orders.update({
          where: { id: orderId },
          data: { payment_status: paymentStatus },
        });
      }

      return tx.orders.findFirst({
        where: { id: orderId },
        include: orderInclude,
      });
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    return this.serialize(order);
  }

  serialize(order: OrderWithRelations): OrderDto {
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

  private async resolveAddress(userId: string, addressId?: string) {
    if (addressId) {
      const address = await this.prisma.addresses.findFirst({
        where: { id: addressId, user_id: userId, deleted_at: null },
      });

      if (!address) {
        throw new NotFoundException('address not found');
      }

      return address;
    }

    const address = await this.prisma.addresses.findFirst({
      where: { user_id: userId, deleted_at: null },
      orderBy: [{ is_default: 'desc' }, { updated_at: 'desc' }],
    });

    if (!address) {
      throw new BadRequestException('no shipping address on file');
    }

    return address;
  }

  private generateOrderNumber(): string {
    const now = new Date();
    const ymd = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const random = Math.floor(100000 + Math.random() * 900000);

    return `ORD-${ymd}-${random}`;
  }
}
