import { gender_enum, product_type_enum } from '@prisma/client';
export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
export type AvailabilityOption = 'in_stock';
export declare class ListProductsQueryDto {
    search?: string;
    brand?: string;
    category?: string;
    gender?: gender_enum;
    type?: product_type_enum;
    fragranceFamily?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: AvailabilityOption;
    discounted?: boolean;
    sort?: SortOption;
    page?: number;
    limit?: number;
}
