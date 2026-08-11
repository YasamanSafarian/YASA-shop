import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProductsService, ProductDto } from '../products/products.service';

export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productCount: number;
}

export interface BrandDetailDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  products: ProductDto[];
}

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async list(): Promise<BrandDto[]> {
    const [brands, groups] = await Promise.all([
      this.prisma.brands.findMany({
        where: { deleted_at: null, is_active: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.products.groupBy({
        by: ['brand_id'],
        where: { deleted_at: null, is_active: true },
        _count: { _all: true },
      }),
    ]);

    const counts = new Map(
      groups.map((group) => [group.brand_id, group._count._all]),
    );

    return brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo_url,
      productCount: counts.get(brand.id) ?? 0,
    }));
  }

  async findBySlug(slug: string): Promise<BrandDetailDto> {
    const brand = await this.prisma.brands.findFirst({
      where: { slug, deleted_at: null, is_active: true },
    });

    if (!brand) {
      throw new NotFoundException('brand not found');
    }

    const products = await this.productsService.listByBrand(brand.id);

    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo_url,
      products,
    };
  }
}
