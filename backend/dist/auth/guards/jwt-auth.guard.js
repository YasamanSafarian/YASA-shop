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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../database/prisma.service");
let JwtAuthGuard = class JwtAuthGuard {
    jwtService;
    configService;
    prisma;
    cacheTtlMs = 30_000;
    cache = new Map();
    constructor(jwtService, configService, prisma) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('missing access token');
        }
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.getOrThrow('jwt.accessSecret'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('invalid or expired access token');
        }
        const status = await this.loadUserStatus(payload.sub);
        if (!status.isActive) {
            throw new common_1.UnauthorizedException('account is disabled');
        }
        request.user = {
            ...payload,
            role: status.role,
        };
        return true;
    }
    async loadUserStatus(userId) {
        const cached = this.cache.get(userId);
        if (cached && cached.expiresAt > Date.now()) {
            return cached;
        }
        const user = await this.prisma.users.findFirst({
            where: { id: userId, deleted_at: null },
            include: { roles: true },
        });
        const status = {
            role: user?.roles?.name ?? '',
            isActive: user?.is_active ?? false,
            expiresAt: Date.now() + this.cacheTtlMs,
        };
        this.cache.set(userId, status);
        return status;
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map