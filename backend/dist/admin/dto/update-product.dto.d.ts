import { concentration_enum, gender_enum } from '@prisma/client';
export declare class UpdateProductDto {
    brandId?: string;
    name?: string;
    slug?: string;
    description?: string;
    gender?: gender_enum;
    concentration?: concentration_enum;
    releaseYear?: number;
    seasons?: string[];
    occasions?: string[];
    isActive?: boolean;
}
