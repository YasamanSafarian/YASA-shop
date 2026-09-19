/** Mirrors backend `shippingFeeForItemCount` — keep in sync with backend/src/common/constants/shipping.ts */
export function shippingFeeForItemCount(itemCount: number): number {
  if (itemCount <= 0) return 0;
  if (itemCount <= 2) return 125000;
  if (itemCount <= 5) return 140000;
  return 170000;
}
