import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('fragrance-families')
export class FragranceFamiliesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    return this.prisma.fragrance_families.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
