import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { MrotpService } from '../otp/mrotp.service';
import { OtpSessionStore } from '../otp/otp-session.store';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
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
    private readonly mrotp;
    private readonly otpSessionStore;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, refreshTokenStore: RefreshTokenStore, mrotp: MrotpService, otpSessionStore: OtpSessionStore);
    requestRegister(dto: RegisterDto): Promise<{
        sessionId: string;
        expiresInSeconds: number;
    }>;
    verifyRegister(dto: VerifyOtpDto): Promise<TokenResponse>;
    login(dto: LoginDto): Promise<TokenResponse>;
    refresh(refreshToken: string): Promise<TokenResponse>;
    logout(refreshToken: string): {
        message: string;
    };
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        sessionId: string;
        expiresInSeconds: number;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<AuthUser>;
    private issueTokens;
    private toAuthUser;
}
