import { Prisma, payments } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListAdminOrdersQueryDto } from './dto/list-admin-orders.query';
import { AdminUpdatePaymentStatusDto } from './dto/update-payment-status.dto';
declare const adminOrderInclude: {
    order_items: {
        orderBy: {
            created_at: "asc";
        };
    };
    users: true;
    payments: {
        orderBy: {
            created_at: "asc";
        };
    };
};
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
export declare class AdminOrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(query: ListAdminOrdersQueryDto): Promise<{
        data: AdminOrderDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(orderId: string): Promise<AdminOrderDto>;
    updateStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<AdminOrderDto>;
    updatePaymentStatus(paymentId: string, dto: AdminUpdatePaymentStatusDto): Promise<{
        id: string;
        orderId: string;
        amount: number;
        method: "cod";
        transactionId: string | null;
        status: import("@prisma/client").$Enums.payment_status_enum;
        paidAt: string | null;
        createdAt: string;
    }>;
    private syncPaymentsOnCancel;
    serializePayment(payment: payments): {
        id: string;
        orderId: string;
        amount: number;
        method: "cod";
        transactionId: string | null;
        status: import("@prisma/client").$Enums.payment_status_enum;
        paidAt: string | null;
        createdAt: string;
    };
    serialize(order: AdminOrderWithRelations): AdminOrderDto;
}
export {};
