import { order_status_enum, payment_status_enum, shipment_status_enum } from '@prisma/client';
export declare class UpdateOrderStatusDto {
    orderStatus?: order_status_enum;
    paymentStatus?: payment_status_enum;
    shipmentStatus?: shipment_status_enum;
}
