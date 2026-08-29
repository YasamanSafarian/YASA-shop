import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

interface CachedUser {
  role: string;
  isActive: boolean;
  expiresAt: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly cacheTtlMs = 30_000;
  private readonly cache = new Map<string, CachedUser>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('missing access token');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
      });
    } catch {
      throw new UnauthorizedException('invalid or expired access token');
    }

    const status = await this.loadUserStatus(payload.sub);
    if (!status.isActive) {
      throw new UnauthorizedException('account is disabled');
    }

    request.user = {
      ...payload,
      // Always trust the live role from the DB, never the (possibly stale)
      // role claim embedded in the token.
      role: status.role,
    };
    return true;
  }

  private async loadUserStatus(userId: string): Promise<CachedUser> {
    const cached = this.cache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached;
    }

    const user = await this.prisma.users.findFirst({
      where: { id: userId, deleted_at: null },
      include: { roles: true },
    });

    const status: CachedUser = {
      role: user?.roles?.name ?? '',
      isActive: user?.is_active ?? false,
      expiresAt: Date.now() + this.cacheTtlMs,
    };

    this.cache.set(userId, status);
    return status;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
