import { order_status_enum, payment_status_enum, shipment_status_enum } from '@prisma/client';
export declare class ListAdminOrdersQueryDto {
    orderStatus?: order_status_enum;
    paymentStatus?: payment_status_enum;
    shipmentStatus?: shipment_status_enum;
    page?: number;
    limit?: number;
}
