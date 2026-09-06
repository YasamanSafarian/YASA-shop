"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANCELLABLE_SHIPMENT_STATUSES = exports.CANCELLABLE_ORDER_STATUSES = void 0;
exports.canCancelOrder = canCancelOrder;
exports.CANCELLABLE_ORDER_STATUSES = [
    'pending',
    'paid',
];
exports.CANCELLABLE_SHIPMENT_STATUSES = [
    'pending',
    'ready',
];
function canCancelOrder(params) {
    return (exports.CANCELLABLE_ORDER_STATUSES.includes(params.order_status) &&
        exports.CANCELLABLE_SHIPMENT_STATUSES.includes(params.shipment_status));
}
//# sourceMappingURL=order-state.js.map