"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../database/prisma.service");
const refresh_token_store_1 = require("./refresh-token.store");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    refreshTokenStore;
    constructor(prisma, jwtService, configService, refreshTokenStore) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.refreshTokenStore = refreshTokenStore;
    }
    async register(dto) {
        const email = dto.email?.toLowerCase().trim() || null;
        if (email) {
            const byEmail = await this.prisma.users.findUnique({ where: { email } });
            if (byEmail) {
                throw new common_1.ConflictException('email already in use');
            }
        }
        const byPhone = await this.prisma.users.findUnique({
            where: { phone: dto.phone },
        });
        if (byPhone) {
            throw new common_1.ConflictException('phone already in use');
        }
        const customerRole = await this.prisma.roles.findUnique({
            where: { name: 'customer' },
        });
        if (!customerRole) {
            throw new common_1.InternalServerErrorException('customer role is not configured');
        }
        const passwordHash = await bcrypt.hash(dto.password, this.configService.getOrThrow('bcryptRounds'));
        const user = await this.prisma.users.create({
            data: {
                role_id: customerRole.id,
                phone: dto.phone,
                email,
                first_name: dto.firstName ?? null,
                last_name: dto.lastName ?? null,
                password_hash: passwordHash,
            },
            include: { roles: true },
        });
        return this.issueTokens(user);
    }
    async login(dto) {
        const identifier = dto.identifier.trim();
        const user = await this.prisma.users.findFirst({
            where: {
                OR: [{ email: identifier }, { phone: identifier }],
                deleted_at: null,
            },
            include: { roles: true },
        });
        if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
            throw new common_1.UnauthorizedException('invalid credentials');
        }
        if (!user.is_active) {
            throw new common_1.UnauthorizedException('account is disabled');
        }
        await this.prisma.users.update({
            where: { id: user.id },
            data: { last_login: new Date() },
        });
        return this.issueTokens(user);
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.getOrThrow('jwt.refreshSecret'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('invalid refresh token');
        }
        if (!this.refreshTokenStore.has(refreshToken)) {
            throw new common_1.UnauthorizedException('invalid refresh token');
        }
        const user = await this.prisma.users.findFirst({
            where: { id: payload.sub, deleted_at: null },
            include: { roles: true },
        });
        if (!user || !user.is_active) {
            throw new common_1.UnauthorizedException('account no longer exists or is disabled');
        }
        this.refreshTokenStore.delete(refreshToken);
        return this.issueTokens(user);
    }
    logout(refreshToken) {
        this.refreshTokenStore.delete(refreshToken);
        return { message: 'logged out' };
    }
    async getProfile(userId) {
        const user = await this.prisma.users.findFirst({
            where: { id: userId, deleted_at: null },
            include: { roles: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('user not found');
        }
        return this.toAuthUser(user);
    }
    async issueTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            phone: user.phone,
            role: user.roles.name,
        };
        const accessSecret = this.configService.getOrThrow('jwt.accessSecret');
        const refreshSecret = this.configService.getOrThrow('jwt.refreshSecret');
        const accessExpiresIn = this.configService.getOrThrow('jwt.accessExpiresIn');
        const refreshExpiresIn = this.configService.getOrThrow('jwt.refreshExpiresIn');
        const refreshPayload = {
            ...payload,
            jti: (0, node_crypto_1.randomUUID)(),
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: accessSecret,
                expiresIn: accessExpiresIn,
            }),
            this.jwtService.signAsync(refreshPayload, {
                secret: refreshSecret,
                expiresIn: refreshExpiresIn,
            }),
        ]);
        const expiresAt = Date.now() + refreshExpiresIn * 1000;
        this.refreshTokenStore.save(refreshToken, user.id, expiresAt);
        return {
            accessToken,
            refreshToken,
            user: this.toAuthUser(user),
        };
    }
    toAuthUser(user) {
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
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        refresh_token_store_1.RefreshTokenStore])
], AuthService);
//# sourceMappingURL=auth.service.js.map