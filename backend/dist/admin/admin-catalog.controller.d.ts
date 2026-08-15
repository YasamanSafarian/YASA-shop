import { AdminCatalogService } from './admin-catalog.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class AdminCatalogController {
    private readonly adminCatalogService;
    constructor(adminCatalogService: AdminCatalogService);
    createBrand(dto: CreateBrandDto): Promise<{
        name: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        logo_url: string | null;
    }>;
    updateBrand(id: string, dto: UpdateBrandDto): Promise<{
        name: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        logo_url: string | null;
    }>;
    removeBrand(id: string): Promise<{
        message: string;
    }>;
    createCategory(dto: CreateCategoryDto): Promise<{
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
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
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
    }>;
    removeCategory(id: string): Promise<{
        message: string;
    }>;
}
