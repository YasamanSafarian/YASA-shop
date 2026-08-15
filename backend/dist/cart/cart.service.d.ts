import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
declare const cartInclude: {
    cart_items: {
        where: {
            deleted_at: null;
        };
        orderBy: {
            created_at: "asc";
        };
        include: {
            product_variants: {
                include: {
                    products: {
                        include: {
                            brands: true;
                        };
                    };
                    product_images: {
                        orderBy: ({
                            is_primary: "desc";
                            sort_order?: undefined;
                        } | {
                            sort_order: "asc";
                            is_primary?: undefined;
                        })[];
                        take: number;
                    };
                };
            };
        };
    };
};
type CartWithRelations = Prisma.cartsGetPayload<{
    include: typeof cartInclude;
}>;
export interface CartItemDto {
    id: string;
    quantity: number;
    lineTotal: number;
    variant: {
        id: string;
        sku: string;
        format: string;
        volumeMl: number;
        price: number;
        compareAtPrice: number | null;
        stockQuantity: number;
        weight: number | null;
        imageUrl: string | null;
        product: {
            id: string;
            name: string;
            slug: string;
            gender: string | null;
            concentration: string | null;
            brand: {
                id: string;
                name: string;
                slug: string;
            };
        };
    };
}
export interface CartDto {
    id: string;
    items: CartItemDto[];
    totals: {
        distinctItems: number;
        itemCount: number;
        subtotal: number;
    };
    createdAt: string;
    updatedAt: string;
}
export declare class CartService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCart(userId: string): Promise<CartDto>;
    addItem(userId: string, dto: AddCartItemDto): Promise<CartDto>;
    updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartDto>;
    removeItem(userId: string, itemId: string): Promise<{
        message: string;
    }>;
    clear(userId: string): Promise<{
        message: string;
    }>;
    serialize(cart: CartWithRelations): CartDto;
    private getOrCreateCart;
    private loadCart;
    private findItem;
    private assertStock;
}
export {};
