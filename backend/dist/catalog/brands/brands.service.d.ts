import { PrismaService } from '../../database/prisma.service';
import { ProductsService, ProductDto } from '../products/products.service';
export interface BrandDto {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    productCount: number;
}
export interface BrandDetailDto {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    products: ProductDto[];
}
export declare class BrandsService {
    private readonly prisma;
    private readonly productsService;
    constructor(prisma: PrismaService, productsService: ProductsService);
    list(): Promise<BrandDto[]>;
    findBySlug(slug: string): Promise<BrandDetailDto>;
}
