import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { NotificationsService } from './notifications.service';
import { ListNotificationsQueryDto } from './dto/list-notifications.query';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(user: JwtPayload, query: ListNotificationsQueryDto): Promise<{
        data: import("./notifications.service").NotificationDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            unreadCount: number;
        };
    }>;
    markAllRead(user: JwtPayload): Promise<{
        message: string;
    }>;
    markRead(user: JwtPayload, id: string): Promise<import("./notifications.service").NotificationDto>;
    remove(user: JwtPayload, id: string): Promise<{
        message: string;
    }>;
}
