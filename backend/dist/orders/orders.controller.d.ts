import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders.query';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(user: JwtPayload, dto: CreateOrderDto): Promise<import("./orders.service").OrderDto>;
    list(user: JwtPayload, query: ListOrdersQueryDto): Promise<import("./orders.service").PaginatedOrders>;
    findById(user: JwtPayload, id: string): Promise<import("./orders.service").OrderDto>;
    cancel(user: JwtPayload, id: string): Promise<import("./orders.service").OrderDto>;
}
