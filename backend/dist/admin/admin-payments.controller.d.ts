import { AdminOrdersService } from './admin-orders.service';
import { AdminUpdatePaymentStatusDto } from './dto/update-payment-status.dto';
export declare class AdminPaymentsController {
    private readonly adminOrdersService;
    constructor(adminOrdersService: AdminOrdersService);
    updateStatus(id: string, dto: AdminUpdatePaymentStatusDto): Promise<{
        id: string;
        orderId: string;
        amount: number;
        method: "cod";
        transactionId: string | null;
        status: import("@prisma/client").$Enums.payment_status_enum;
        paidAt: string | null;
        createdAt: string;
    }>;
}
