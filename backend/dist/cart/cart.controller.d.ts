import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(user: JwtPayload): Promise<import("./cart.service").CartDto>;
    addItem(user: JwtPayload, dto: AddCartItemDto): Promise<import("./cart.service").CartDto>;
    updateItem(user: JwtPayload, id: string, dto: UpdateCartItemDto): Promise<import("./cart.service").CartDto>;
    removeItem(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
    clear(user: JwtPayload): Promise<{
        message: string;
    }>;
}
