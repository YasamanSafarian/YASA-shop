import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders.query';
declare const orderInclude: {
    order_items: {
        orderBy: {
            created_at: "asc";
        };
    };
    payments: {
        orderBy: {
            created_at: "asc";
        };
    };
};
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
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateOrderDto): Promise<OrderDto>;
    list(userId: string, query: ListOrdersQueryDto): Promise<PaginatedOrders>;
    findById(userId: string, orderId: string): Promise<OrderDto>;
    cancel(userId: string, orderId: string): Promise<OrderDto>;
    serialize(order: OrderWithRelations): OrderDto;
    private resolveAddress;
    private generateOrderNumber;
}
export {};
