import { PrismaService } from '../database/prisma.service';
import { ProductsService } from '../catalog/products/products.service';
import { ProductDto } from '../catalog/products/products.service';
export declare class WishlistService {
    private readonly prisma;
    private readonly productsService;
    constructor(prisma: PrismaService, productsService: ProductsService);
    list(userId: string): Promise<ProductDto[]>;
    add(userId: string, productId: string): Promise<{
        message: string;
    }>;
    remove(userId: string, productId: string): Promise<{
        message: string;
    }>;
}
