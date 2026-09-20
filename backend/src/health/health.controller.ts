import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PRODUCT_TYPE_VALUES } from '../common/constants/product-types';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException('database unreachable');
    }

    return { status: 'ok' };
  }

  /** Deploy check: confirms API accepts cream_lotion / gift_box. */
  @Get('product-types')
  productTypes() {
    return { productTypes: PRODUCT_TYPE_VALUES };
  }
}
