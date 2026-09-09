import {
  BadGatewayException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MrotpService } from '../otp/mrotp.service';
import { OtpSessionStore } from '../otp/otp-session.store';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenStore } from './refresh-token.store';
import { JwtPayload } from './interfaces/jwt-payload.interface';

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

type UserWithRole = Prisma.usersGetPayload<{ include: { roles: true } }>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenStore: RefreshTokenStore,
    private readonly mrotp: MrotpService,
    private readonly otpSessionStore: OtpSessionStore,
  ) {}

  async requestRegister(dto: RegisterDto): Promise<{ sessionId: string; expiresInSeconds: number }> {
    const email = dto.email?.toLowerCase().trim() || null;

    if (email) {
      const byEmail = await this.prisma.users.findUnique({ where: { email } });
      if (byEmail) {
        throw new ConflictException('email already in use');
      }
    }

    const byPhone = await this.prisma.users.findUnique({
      where: { phone: dto.phone },
    });
    if (byPhone) {
      throw new ConflictException('phone already in use');
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      this.configService.getOrThrow<number>('bcryptRounds'),
    );

    const sessionId = randomUUID();
    const expiresInSeconds = 180;

    this.otpSessionStore.save(sessionId, {
      phone: dto.phone,
      purpose: 'register',
      pending: {
        email,
        passwordHash,
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
      },
      expiresAt: Date.now() + expiresInSeconds * 1000,
    });

    const result = await this.mrotp.sendOtp(dto.phone);
    if (!result.ok) {
      throw new BadGatewayException(
        result.message || `SMS delivery failed (code ${result.code})`,
      );
    }

    return { sessionId, expiresInSeconds };
  }

  async verifyRegister(dto: VerifyOtpDto): Promise<TokenResponse> {
    const session = this.otpSessionStore.consume(dto.sessionId);
    if (!session || session.purpose !== 'register' || !session.pending) {
      throw new UnauthorizedException('invalid or expired session');
    }

    const verified = await this.mrotp.verifyOtp(session.phone, dto.otp);
    if (!verified.ok) {
      throw new UnauthorizedException('invalid verification code');
    }

    const pending = session.pending;

    const email = pending.email;
    if (email) {
      const byEmail = await this.prisma.users.findUnique({ where: { email } });
      if (byEmail) {
        throw new ConflictException('email already in use');
      }
    }
    const byPhone = await this.prisma.users.findUnique({
      where: { phone: session.phone },
    });
    if (byPhone) {
      throw new ConflictException('phone already in use');
    }

    const customerRole = await this.prisma.roles.findUnique({
      where: { name: 'customer' },
    });
    if (!customerRole) {
      throw new InternalServerErrorException('customer role is not configured');
    }

    const user = await this.prisma.users.create({
      data: {
        role_id: customerRole.id,
        phone: session.phone,
        email,
        first_name: pending.firstName ?? null,
        last_name: pending.lastName ?? null,
        password_hash: pending.passwordHash,
      },
      include: { roles: true },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<TokenResponse> {
    const identifier = dto.identifier.trim();

    const user = await this.prisma.users.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
        deleted_at: null,
      },
      include: { roles: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('account is disabled');
    }

    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<TokenResponse> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('invalid refresh token');
    }

    if (!this.refreshTokenStore.has(refreshToken)) {
      throw new UnauthorizedException('invalid refresh token');
    }

    const user = await this.prisma.users.findFirst({
      where: { id: payload.sub, deleted_at: null },
      include: { roles: true },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException(
        'account no longer exists or is disabled',
      );
    }

    this.refreshTokenStore.delete(refreshToken);
    return this.issueTokens(user);
  }

  logout(refreshToken: string): { message: string } {
    this.refreshTokenStore.delete(refreshToken);
    return { message: 'logged out' };
  }

  /**
   * Sends an SMS OTP to the account's mobile number for password recovery.
   * The OTP is verified via MrOTP.verifyOTP during resetPassword and is
   * never exposed to the backend as plaintext.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{
    sessionId: string;
    expiresInSeconds: number;
  }> {
    const identifier = dto.identifier.trim().toLowerCase();

    const user = await this.prisma.users.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
        deleted_at: null,
      },
    });

    if (!user || !user.is_active || !user.phone) {
      throw new UnauthorizedException('account not found or disabled');
    }

    const sessionId = randomUUID();
    const expiresInSeconds = 180;

    this.otpSessionStore.save(sessionId, {
      phone: user.phone,
      purpose: 'reset-password',
      userId: user.id,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    });

    const result = await this.mrotp.sendOtp(user.phone);
    if (!result.ok) {
      throw new BadGatewayException(
        result.message || `SMS delivery failed (code ${result.code})`,
      );
    }

    return { sessionId, expiresInSeconds };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const session = this.otpSessionStore.consume(dto.sessionId);
    if (!session || session.purpose !== 'reset-password' || !session.userId) {
      throw new UnauthorizedException('invalid or expired session');
    }

    const verified = await this.mrotp.verifyOtp(session.phone, dto.otp);
    if (!verified.ok) {
      throw new UnauthorizedException('invalid verification code');
    }

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      this.configService.getOrThrow<number>('bcryptRounds'),
    );

    await this.prisma.users.update({
      where: { id: session.userId },
      data: { password_hash: passwordHash },
    });

    this.refreshTokenStore.deleteForUser(session.userId);

    return { message: 'password has been reset' };
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.prisma.users.findFirst({
      where: { id: userId, deleted_at: null },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('user not found');
    }

    return this.toAuthUser(user);
  }

  private async issueTokens(user: UserWithRole): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.roles.name,
    };

    const accessSecret =
      this.configService.getOrThrow<string>('jwt.accessSecret');
    const refreshSecret =
      this.configService.getOrThrow<string>('jwt.refreshSecret');
    const accessExpiresIn = this.configService.getOrThrow<number>(
      'jwt.accessExpiresIn',
    );
    const refreshExpiresIn = this.configService.getOrThrow<number>(
      'jwt.refreshExpiresIn',
    );

    const refreshPayload: JwtPayload = {
      ...payload,
      jti: randomUUID(),
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

  private toAuthUser(user: UserWithRole): AuthUser {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.roles.name,
    };
  }
}
