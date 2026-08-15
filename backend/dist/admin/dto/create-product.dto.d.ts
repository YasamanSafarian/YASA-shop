import { concentration_enum, gender_enum, product_format_enum } from '@prisma/client';
export declare class CreateVariantDto {
    sku: string;
    barcode?: string;
    format: product_format_enum;
    volumeMl: number;
    price: number;
    compareAtPrice?: number;
    stockQuantity?: number;
    weight?: number;
    isDefault?: boolean;
    isActive?: boolean;
}
export declare class CreateProductDto {
    brandId: string;
    name: string;
    slug?: string;
    description?: string;
    gender?: gender_enum;
    concentration?: concentration_enum;
    releaseYear?: number;
    seasons?: string[];
    occasions?: string[];
    isActive?: boolean;
    variants?: CreateVariantDto[];
    categoryIds?: string[];
}
