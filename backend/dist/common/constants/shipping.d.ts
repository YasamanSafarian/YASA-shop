export interface ShippingTier {
    label: string;
    shippingFee: number;
}
export declare const SHIPPING_TIERS: ShippingTier[];
export declare function shippingFeeForItemCount(itemCount: number): number;
