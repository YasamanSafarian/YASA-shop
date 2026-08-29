import { order_status_enum, shipment_status_enum } from '@prisma/client';
export declare const CANCELLABLE_ORDER_STATUSES: order_status_enum[];
export declare const CANCELLABLE_SHIPMENT_STATUSES: shipment_status_enum[];
export declare function canCancelOrder(params: {
    order_status: order_status_enum;
    shipment_status: shipment_status_enum;
}): boolean;
