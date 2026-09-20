/** Keep in sync with prisma `product_type_enum`. */
export const PRODUCT_TYPE_VALUES = [
  'perfume',
  'body_spray',
  'charm_bag',
  'candle',
  'cream_lotion',
  'gift_box',
] as const;

export type ProductTypeValue = (typeof PRODUCT_TYPE_VALUES)[number];

export const PRODUCT_TYPE_VALUES_MESSAGE = `productType must be one of: ${PRODUCT_TYPE_VALUES.join(', ')}`;
