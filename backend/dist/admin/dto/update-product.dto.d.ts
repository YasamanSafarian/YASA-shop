import { concentration_enum, gender_enum, product_type_enum } from '@prisma/client';
export declare class UpdateProductDto {
    brandId?: string;
    name?: string;
    slug?: string;
    description?: string;
    productType?: product_type_enum;
    gender?: gender_enum;
    concentration?: concentration_enum;
    releaseYear?: number;
    seasons?: string[];
    occasions?: string[];
    isActive?: boolean;
    categoryIds?: string[];
}
