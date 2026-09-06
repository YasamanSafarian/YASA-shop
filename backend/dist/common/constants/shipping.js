"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHIPPING_TIERS = void 0;
exports.shippingFeeForItemCount = shippingFeeForItemCount;
exports.SHIPPING_TIERS = [
    { label: '1-2', shippingFee: 125000 },
    { label: '3-5', shippingFee: 140000 },
    { label: '6+', shippingFee: 170000 },
];
function shippingFeeForItemCount(itemCount) {
    if (itemCount <= 2)
        return 125000;
    if (itemCount <= 5)
        return 140000;
    return 170000;
}
//# sourceMappingURL=shipping.js.map