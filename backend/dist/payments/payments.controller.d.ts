import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PaymentsService } from './payments.service';
import { PayOrderDto } from './dto/pay-order.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    pay(user: JwtPayload, id: string, dto: PayOrderDto): Promise<import("./payments.service").PaymentDto>;
}
