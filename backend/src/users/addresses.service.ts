import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.addresses.findMany({
      where: { user_id: userId, deleted_at: null },
      orderBy: [{ is_default: 'desc' }, { updated_at: 'desc' }],
    });
  }

  create(userId: string, dto: CreateAddressDto) {
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

  async update(userId: string, id: string, dto: UpdateAddressDto) {
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

  async remove(userId: string, id: string): Promise<{ message: string }> {
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

  private async findOwned(userId: string, id: string) {
    const address = await this.prisma.addresses.findFirst({
      where: { id, user_id: userId, deleted_at: null },
    });

    if (!address) {
      throw new NotFoundException('address not found');
    }

    return address;
  }
}
