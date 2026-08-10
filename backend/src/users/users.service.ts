import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

type UserWithRole = Prisma.usersGetPayload<{ include: { roles: true } }>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.findActiveUser(userId);
    return this.toProfile(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfile> {
    await this.findActiveUser(userId);

    const data: Prisma.usersUpdateInput = {};
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
      throw new BadRequestException('no fields to update');
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

  private async findActiveUser(userId: string): Promise<UserWithRole> {
    const user = await this.prisma.users.findFirst({
      where: { id: userId, deleted_at: null },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('user not found');
    }

    return user;
  }

  private async assertEmailAvailable(
    email: string,
    excludeUserId: string,
  ): Promise<void> {
    const existing = await this.prisma.users.findUnique({ where: { email } });
    if (existing && existing.id !== excludeUserId) {
      throw new ConflictException('email already in use');
    }
  }

  private async assertPhoneAvailable(
    phone: string,
    excludeUserId: string,
  ): Promise<void> {
    const existing = await this.prisma.users.findUnique({ where: { phone } });
    if (existing && existing.id !== excludeUserId) {
      throw new ConflictException('phone already in use');
    }
  }

  private toProfile(user: UserWithRole): UserProfile {
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
