import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListNotificationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.notificationsWhereInput = {
      user_id: userId,
      deleted_at: null,
    };

    const [total, unreadCount, notifications] = await Promise.all([
      this.prisma.notifications.count({ where }),
      this.prisma.notifications.count({
        where: { ...where, is_read: false },
      }),
      this.prisma.notifications.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: notifications.map((notification) => this.serialize(notification)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  async markRead(userId: string, id: string): Promise<NotificationDto> {
    const notification = await this.prisma.notifications.findFirst({
      where: { id, user_id: userId, deleted_at: null },
    });

    if (!notification) {
      throw new NotFoundException('notification not found');
    }

    const updated = await this.prisma.notifications.update({
      where: { id },
      data: { is_read: true, updated_at: new Date() },
    });

    return this.serialize(updated);
  }

  async markAllRead(userId: string): Promise<{ message: string }> {
    await this.prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false, deleted_at: null },
      data: { is_read: true, updated_at: new Date() },
    });

    return { message: 'all notifications marked as read' };
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const notification = await this.prisma.notifications.findFirst({
      where: { id, user_id: userId, deleted_at: null },
    });

    if (!notification) {
      throw new NotFoundException('notification not found');
    }

    await this.prisma.notifications.update({
      where: { id },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });

    return { message: 'notification deleted' };
  }

  serialize(notification: {
    id: string;
    type: string;
    title: string;
    message: string | null;
    is_read: boolean;
    created_at: Date;
  }): NotificationDto {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.is_read,
      createdAt: notification.created_at.toISOString(),
    };
  }
}
