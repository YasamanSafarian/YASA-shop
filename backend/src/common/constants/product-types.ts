/** Allowed product types — keep in sync with prisma `product_type_enum`. */
export const PRODUCT_TYPE_VALUES: string[] = [
  'perfume',
  'body_spray',
  'charm_bag',
  'candle',
  'cream_lotion',
  'gift_box',
];

export type ProductTypeValue =
  | 'perfume'
  | 'body_spray'
  | 'charm_bag'
  | 'candle'
  | 'cream_lotion'
  | 'gift_box';

export const PRODUCT_TYPE_VALUES_MESSAGE =
  'productType must be one of: perfume, body_spray, charm_bag, candle, cream_lotion, gift_box';

export function isProductTypeValue(value: unknown): value is ProductTypeValue {
  return typeof value === 'string' && PRODUCT_TYPE_VALUES.includes(value);
}
