import { gender_enum } from '@prisma/client';
export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
export type AvailabilityOption = 'in_stock';
export declare class ListProductsQueryDto {
    search?: string;
    brand?: string;
    category?: string;
    gender?: gender_enum;
    minPrice?: number;
    maxPrice?: number;
    availability?: AvailabilityOption;
    sort?: SortOption;
    page?: number;
    limit?: number;
}
