export interface ShippingTier {
  label: string;
  shippingFee: number;
}

export const SHIPPING_TIERS: ShippingTier[] = [
  { label: '1-2', shippingFee: 125000 },
  { label: '3-5', shippingFee: 140000 },
  { label: '6+', shippingFee: 170000 },
];

export function shippingFeeForItemCount(itemCount: number): number {
  if (itemCount <= 2) return 125000;
  if (itemCount <= 5) return 140000;
  return 170000;
}
