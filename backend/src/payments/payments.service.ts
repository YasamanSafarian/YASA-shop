import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { payments } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { PayOrderDto } from './dto/pay-order.dto';

export interface PaymentDto {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  transactionId: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async pay(
    userId: string,
    orderId: string,
    dto: PayOrderDto,
  ): Promise<PaymentDto> {
    const order = await this.prisma.orders.findFirst({
      where: { id: orderId, user_id: userId, deleted_at: null },
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    if (
      order.order_status === 'cancelled' ||
      order.order_status === 'returned'
    ) {
      throw new BadRequestException(
        'order cannot be paid in its current status',
      );
    }

    const existing = await this.prisma.payments.findFirst({
      where: { order_id: orderId },
    });

    if (existing) {
      throw new BadRequestException('payment already recorded for this order');
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

  serialize(payment: payments): PaymentDto {
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
}
