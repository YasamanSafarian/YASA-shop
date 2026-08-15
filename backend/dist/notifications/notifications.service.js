"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
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
    async markRead(userId, id) {
        const notification = await this.prisma.notifications.findFirst({
            where: { id, user_id: userId, deleted_at: null },
        });
        if (!notification) {
            throw new common_1.NotFoundException('notification not found');
        }
        const updated = await this.prisma.notifications.update({
            where: { id },
            data: { is_read: true, updated_at: new Date() },
        });
        return this.serialize(updated);
    }
    async markAllRead(userId) {
        await this.prisma.notifications.updateMany({
            where: { user_id: userId, is_read: false, deleted_at: null },
            data: { is_read: true, updated_at: new Date() },
        });
        return { message: 'all notifications marked as read' };
    }
    async remove(userId, id) {
        const notification = await this.prisma.notifications.findFirst({
            where: { id, user_id: userId, deleted_at: null },
        });
        if (!notification) {
            throw new common_1.NotFoundException('notification not found');
        }
        await this.prisma.notifications.update({
            where: { id },
            data: { deleted_at: new Date(), updated_at: new Date() },
        });
        return { message: 'notification deleted' };
    }
    serialize(notification) {
        return {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            isRead: notification.is_read,
            createdAt: notification.created_at.toISOString(),
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map