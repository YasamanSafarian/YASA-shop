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

    // productTypes on /health so deploy checks work even if a reverse proxy
    // or old process mishandles nested routes.
    return {
      status: 'ok',
      productTypes: PRODUCT_TYPE_VALUES,
    };
  }

  @Get('product-types')
  productTypes() {
    return { productTypes: PRODUCT_TYPE_VALUES };
  }
}
