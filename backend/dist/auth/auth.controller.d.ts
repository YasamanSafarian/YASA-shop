import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("./auth.service").TokenResponse>;
    login(dto: LoginDto): Promise<import("./auth.service").TokenResponse>;
    refresh(dto: RefreshDto): Promise<import("./auth.service").TokenResponse>;
    logout(dto: LogoutDto): {
        message: string;
    };
    me(user: JwtPayload): Promise<import("./auth.service").AuthUser>;
}
