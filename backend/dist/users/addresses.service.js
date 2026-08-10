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
exports.AddressesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let AddressesService = class AddressesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(userId) {
        return this.prisma.addresses.findMany({
            where: { user_id: userId, deleted_at: null },
            orderBy: [{ is_default: 'desc' }, { updated_at: 'desc' }],
        });
    }
    create(userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const count = await tx.addresses.count({
                where: { user_id: userId, deleted_at: null },
            });
            const isDefault = dto.isDefault ?? count === 0;
            if (isDefault) {
                await tx.addresses.updateMany({
                    where: { user_id: userId, deleted_at: null },
                    data: { is_default: false },
                });
            }
            return tx.addresses.create({
                data: {
                    user_id: userId,
                    receiver_name: dto.receiverName,
                    receiver_phone: dto.receiverPhone,
                    province: dto.province,
                    city: dto.city,
                    postal_code: dto.postalCode,
                    address: dto.address,
                    is_default: isDefault,
                },
            });
        });
    }
    async update(userId, id, dto) {
        await this.findOwned(userId, id);
        return this.prisma.$transaction(async (tx) => {
            if (dto.isDefault === true) {
                await tx.addresses.updateMany({
                    where: { user_id: userId, deleted_at: null },
                    data: { is_default: false },
                });
            }
            return tx.addresses.update({
                where: { id },
                data: {
                    ...(dto.receiverName !== undefined && {
                        receiver_name: dto.receiverName,
                    }),
                    ...(dto.receiverPhone !== undefined && {
                        receiver_phone: dto.receiverPhone,
                    }),
                    ...(dto.province !== undefined && { province: dto.province }),
                    ...(dto.city !== undefined && { city: dto.city }),
                    ...(dto.postalCode !== undefined && {
                        postal_code: dto.postalCode,
                    }),
                    ...(dto.address !== undefined && { address: dto.address }),
                    ...(dto.isDefault !== undefined && { is_default: dto.isDefault }),
                },
            });
        });
    }
    async remove(userId, id) {
        const existing = await this.findOwned(userId, id);
        await this.prisma.$transaction(async (tx) => {
            await tx.addresses.update({
                where: { id },
                data: { deleted_at: new Date() },
            });
            if (existing.is_default) {
                const next = await tx.addresses.findFirst({
                    where: { user_id: userId, deleted_at: null },
                    orderBy: { updated_at: 'desc' },
                });
                if (next) {
                    await tx.addresses.update({
                        where: { id: next.id },
                        data: { is_default: true },
                    });
                }
            }
        });
        return { message: 'address deleted' };
    }
    async findOwned(userId, id) {
        const address = await this.prisma.addresses.findFirst({
            where: { id, user_id: userId, deleted_at: null },
        });
        if (!address) {
            throw new common_1.NotFoundException('address not found');
        }
        return address;
    }
};
exports.AddressesService = AddressesService;
exports.AddressesService = AddressesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddressesService);
//# sourceMappingURL=addresses.service.js.map