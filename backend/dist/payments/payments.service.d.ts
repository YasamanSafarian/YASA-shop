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
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    pay(userId: string, orderId: string, dto: PayOrderDto): Promise<PaymentDto>;
    serialize(payment: payments): PaymentDto;
}
