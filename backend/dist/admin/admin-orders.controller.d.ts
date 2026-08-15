import { AdminOrdersService } from './admin-orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListAdminOrdersQueryDto } from './dto/list-admin-orders.query';
export declare class AdminOrdersController {
    private readonly adminOrdersService;
    constructor(adminOrdersService: AdminOrdersService);
    list(query: ListAdminOrdersQueryDto): Promise<{
        data: import("./admin-orders.service").AdminOrderDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<import("./admin-orders.service").AdminOrderDto>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<import("./admin-orders.service").AdminOrderDto>;
}
