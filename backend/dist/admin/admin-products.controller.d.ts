import { AdminProductsService } from './admin-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ListAdminProductsQueryDto } from './dto/list-admin-products.query';
export declare class AdminProductsController {
    private readonly adminProductsService;
    constructor(adminProductsService: AdminProductsService);
    list(query: ListAdminProductsQueryDto): Promise<{
        data: {
            id: string;
            name: string;
            slug: string;
            brand: {
                id: string;
                name: string;
            };
            gender: import("@prisma/client").$Enums.gender_enum | null;
            concentration: import("@prisma/client").$Enums.concentration_enum | null;
            isActive: boolean;
            variantCount: number;
            createdAt: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    create(dto: CreateProductDto): Promise<{
        brands: {
            name: string;
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            slug: string;
            logo_url: string | null;
        };
        product_categories: ({
            categories: {
                name: string;
                id: string;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                deleted_at: Date | null;
                slug: string;
                parent_id: string | null;
                image_url: string | null;
                sort_order: number;
            };
        } & {
            product_id: string;
            category_id: string;
        })[];
        product_fragrance_families: ({
            fragrance_families: {
                name: string;
                id: string;
                slug: string;
            };
        } & {
            product_id: string;
            fragrance_family_id: string;
        })[];
        product_notes: ({
            notes: {
                name: string;
                id: string;
                slug: string;
            };
        } & {
            product_id: string;
            note_id: string;
            note_type: import("@prisma/client").$Enums.note_type_enum;
        })[];
        product_variants: ({
            product_images: {
                id: string;
                created_at: Date;
                image_url: string;
                sort_order: number;
                variant_id: string;
                alt_text: string | null;
                is_primary: boolean;
            }[];
        } & {
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            is_default: boolean;
            price: import("@prisma/client-runtime-utils").Decimal;
            product_id: string;
            sku: string;
            barcode: string | null;
            format: import("@prisma/client").$Enums.product_format_enum;
            volume_ml: number;
            compare_at_price: import("@prisma/client-runtime-utils").Decimal | null;
            stock_quantity: number;
            weight: number | null;
        })[];
    } & {
        name: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        description: string | null;
        gender: import("@prisma/client").$Enums.gender_enum | null;
        brand_id: string;
        slug: string;
        concentration: import("@prisma/client").$Enums.concentration_enum | null;
        release_year: number | null;
        seasons: string[];
        occasions: string[];
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        brands: {
            name: string;
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            slug: string;
            logo_url: string | null;
        };
        product_categories: ({
            categories: {
                name: string;
                id: string;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                deleted_at: Date | null;
                slug: string;
                parent_id: string | null;
                image_url: string | null;
                sort_order: number;
            };
        } & {
            product_id: string;
            category_id: string;
        })[];
        product_fragrance_families: ({
            fragrance_families: {
                name: string;
                id: string;
                slug: string;
            };
        } & {
            product_id: string;
            fragrance_family_id: string;
        })[];
        product_notes: ({
            notes: {
                name: string;
                id: string;
                slug: string;
            };
        } & {
            product_id: string;
            note_id: string;
            note_type: import("@prisma/client").$Enums.note_type_enum;
        })[];
        product_variants: ({
            product_images: {
                id: string;
                created_at: Date;
                image_url: string;
                sort_order: number;
                variant_id: string;
                alt_text: string | null;
                is_primary: boolean;
            }[];
        } & {
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            is_default: boolean;
            price: import("@prisma/client-runtime-utils").Decimal;
            product_id: string;
            sku: string;
            barcode: string | null;
            format: import("@prisma/client").$Enums.product_format_enum;
            volume_ml: number;
            compare_at_price: import("@prisma/client-runtime-utils").Decimal | null;
            stock_quantity: number;
            weight: number | null;
        })[];
    } & {
        name: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        description: string | null;
        gender: import("@prisma/client").$Enums.gender_enum | null;
        brand_id: string;
        slug: string;
        concentration: import("@prisma/client").$Enums.concentration_enum | null;
        release_year: number | null;
        seasons: string[];
        occasions: string[];
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    addVariant(id: string, dto: CreateVariantDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        is_default: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        product_id: string;
        sku: string;
        barcode: string | null;
        format: import("@prisma/client").$Enums.product_format_enum;
        volume_ml: number;
        compare_at_price: import("@prisma/client-runtime-utils").Decimal | null;
        stock_quantity: number;
        weight: number | null;
    }>;
    updateStock(variantId: string, dto: UpdateStockDto): Promise<{
        id: string;
        sku: string;
        stockQuantity: number;
    }>;
    updateVariant(variantId: string, dto: UpdateVariantDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        is_default: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        product_id: string;
        sku: string;
        barcode: string | null;
        format: import("@prisma/client").$Enums.product_format_enum;
        volume_ml: number;
        compare_at_price: import("@prisma/client-runtime-utils").Decimal | null;
        stock_quantity: number;
        weight: number | null;
    }>;
    removeVariant(variantId: string): Promise<{
        message: string;
    }>;
}
