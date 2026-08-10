import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenStore } from './refresh-token.store';
export interface AuthUser {
    id: string;
    email: string | null;
    phone: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
}
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly refreshTokenStore;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, refreshTokenStore: RefreshTokenStore);
    register(dto: RegisterDto): Promise<TokenResponse>;
    login(dto: LoginDto): Promise<TokenResponse>;
    refresh(refreshToken: string): Promise<TokenResponse>;
    logout(refreshToken: string): {
        message: string;
    };
    getProfile(userId: string): Promise<AuthUser>;
    private issueTokens;
    private toAuthUser;
}
