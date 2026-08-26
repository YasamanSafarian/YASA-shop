import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

const PAYMENT_DEADLINE_MINUTES = 35;

@Injectable()
export class OrderExpiryService {
  private readonly logger = new Logger(OrderExpiryService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/1 * * * *')
  async cancelExpiredOrders() {
    const deadline = new Date(
      Date.now() - PAYMENT_DEADLINE_MINUTES * 60 * 1000,
    );

    const expired = await this.prisma.orders.findMany({
      where: {
        order_status: 'pending',
        payment_status: 'pending',
        created_at: { lt: deadline },
        deleted_at: null,
      },
    });

    if (!expired.length) return;

    this.logger.warn(
      `Cancelling ${expired.length} expired order(s) older than ${PAYMENT_DEADLINE_MINUTES}min`,
    );

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
      } catch (err) {
        this.logger.error(
          `Failed to cancel order ${order.order_number}: ${err}`,
        );
      }
    }
  }
}
