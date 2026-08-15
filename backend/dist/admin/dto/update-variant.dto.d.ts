import { product_format_enum } from '@prisma/client';
export declare class UpdateVariantDto {
    sku?: string;
    barcode?: string;
    format?: product_format_enum;
    volumeMl?: number;
    price?: number;
    compareAtPrice?: number;
    stockQuantity?: number;
    weight?: number;
    isDefault?: boolean;
    isActive?: boolean;
}
