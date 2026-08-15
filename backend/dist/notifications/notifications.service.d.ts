import { PrismaService } from '../database/prisma.service';
import { ListNotificationsQueryDto } from './dto/list-notifications.query';
export interface NotificationDto {
    id: string;
    type: string;
    title: string;
    message: string | null;
    isRead: boolean;
    createdAt: string;
}
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(userId: string, query: ListNotificationsQueryDto): Promise<{
        data: NotificationDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            unreadCount: number;
        };
    }>;
    markRead(userId: string, id: string): Promise<NotificationDto>;
    markAllRead(userId: string): Promise<{
        message: string;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    serialize(notification: {
        id: string;
        type: string;
        title: string;
        message: string | null;
        is_read: boolean;
        created_at: Date;
    }): NotificationDto;
}
