import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        sessionId: string;
        expiresInSeconds: number;
    }>;
    verifyRegister(dto: VerifyOtpDto): Promise<import("./auth.service").TokenResponse>;
    login(dto: LoginDto): Promise<import("./auth.service").TokenResponse>;
    refresh(dto: RefreshDto): Promise<import("./auth.service").TokenResponse>;
    logout(dto: LogoutDto): {
        message: string;
    };
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        sessionId: string;
        expiresInSeconds: number;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    me(user: JwtPayload): Promise<import("./auth.service").AuthUser>;
}
