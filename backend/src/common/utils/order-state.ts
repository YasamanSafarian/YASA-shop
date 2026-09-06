import { order_status_enum, shipment_status_enum } from '@prisma/client';

export const CANCELLABLE_ORDER_STATUSES: order_status_enum[] = [
  'pending',
  'paid',
];

export const CANCELLABLE_SHIPMENT_STATUSES: shipment_status_enum[] = [
  'pending',
  'ready',
];

/**
 * An order may be cancelled only while it has not been dispatched (or worse)
 * and is not yet in a terminal/further state. Once goods have left the
 * warehouse (sent/shipped/delivered) or the order is already cancelled/returned,
 * cancellation must be rejected and stock must NOT be restored.
 */
export function canCancelOrder(params: {
  order_status: order_status_enum;
  shipment_status: shipment_status_enum;
}): boolean {
  return (
    CANCELLABLE_ORDER_STATUSES.includes(params.order_status) &&
    CANCELLABLE_SHIPMENT_STATUSES.includes(params.shipment_status)
  );
}
