import { PrismaService } from '../database/prisma.service';
export declare class OrderExpiryService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    cancelExpiredOrders(): Promise<void>;
}
