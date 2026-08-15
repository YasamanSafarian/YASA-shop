import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    list(user: JwtPayload): Promise<import("../catalog/products/products.service").ProductDto[]>;
    add(user: JwtPayload, dto: AddWishlistItemDto): Promise<{
        message: string;
    }>;
    remove(user: JwtPayload, productId: string): Promise<{
        message: string;
    }>;
}
