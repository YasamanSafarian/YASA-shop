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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.findActiveUser(userId);
        return this.toProfile(user);
    }
    async updateProfile(userId, dto) {
        await this.findActiveUser(userId);
        const data = {};
        if (dto.firstName !== undefined) {
            data.first_name = dto.firstName;
        }
        if (dto.lastName !== undefined) {
            data.last_name = dto.lastName;
        }
        if (dto.email !== undefined) {
            data.email = dto.email.toLowerCase().trim() || null;
        }
        if (dto.phone !== undefined) {
            data.phone = dto.phone;
        }
        if (Object.keys(data).length === 0) {
            throw new common_1.BadRequestException('no fields to update');
        }
        if (dto.email) {
            await this.assertEmailAvailable(dto.email.toLowerCase().trim(), userId);
        }
        if (dto.phone) {
            await this.assertPhoneAvailable(dto.phone, userId);
        }
        const user = await this.prisma.users.update({
            where: { id: userId },
            data,
            include: { roles: true },
        });
        return this.toProfile(user);
    }
    async findActiveUser(userId) {
        const user = await this.prisma.users.findFirst({
            where: { id: userId, deleted_at: null },
            include: { roles: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('user not found');
        }
        return user;
    }
    async assertEmailAvailable(email, excludeUserId) {
        const existing = await this.prisma.users.findUnique({ where: { email } });
        if (existing && existing.id !== excludeUserId) {
            throw new common_1.ConflictException('email already in use');
        }
    }
    async assertPhoneAvailable(phone, excludeUserId) {
        const existing = await this.prisma.users.findUnique({ where: { phone } });
        if (existing && existing.id !== excludeUserId) {
            throw new common_1.ConflictException('phone already in use');
        }
    }
    toProfile(user) {
        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.roles.name,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map