import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ListProductsQueryDto } from './dto/list-products.query';
export declare const productInclude: {
    brands: true;
    product_categories: {
        include: {
            categories: true;
        };
    };
    product_variants: {
        where: {
            is_active: true;
            deleted_at: null;
        };
        orderBy: {
            price: "asc";
        };
        include: {
            product_images: true;
        };
    };
    product_notes: {
        include: {
            notes: true;
        };
    };
    product_fragrance_families: {
        include: {
            fragrance_families: true;
        };
    };
};
export type ProductWithRelations = Prisma.productsGetPayload<{
    include: typeof productInclude;
}>;
export interface ProductVariantDto {
    id: string;
    sku: string;
    barcode: string | null;
    format: string;
    volumeMl: number;
    price: number;
    compareAtPrice: number | null;
    stockQuantity: number;
    weight: number | null;
    isDefault: boolean;
    isActive: boolean;
    images: {
        id: string;
        imageUrl: string;
        altText: string | null;
        sortOrder: number;
        isPrimary: boolean;
    }[];
}
export interface ProductDto {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    gender: string | null;
    concentration: string | null;
    releaseYear: number | null;
    seasons: string[];
    occasions: string[];
    brand: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
    };
    categories: {
        id: string;
        name: string;
        slug: string;
    }[];
    variants: ProductVariantDto[];
    notes: {
        top: string[];
        middle: string[];
        base: string[];
    };
    fragranceFamilies: {
        id: string;
        name: string;
        slug: string;
    }[];
    createdAt: string;
    updatedAt: string;
}
export interface PaginatedProducts {
    data: ProductDto[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(query: ListProductsQueryDto): Promise<PaginatedProducts>;
    findBySlug(slug: string): Promise<ProductDto>;
    listByBrand(brandId: string): Promise<ProductDto[]>;
    serialize(product: ProductWithRelations): ProductDto;
    private buildWhere;
    private resolveCategoryAndDescendants;
}
