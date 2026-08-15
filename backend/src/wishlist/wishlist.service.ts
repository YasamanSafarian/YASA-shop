import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  ProductsService,
  productInclude,
} from '../catalog/products/products.service';
import { ProductDto } from '../catalog/products/products.service';

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async list(userId: string): Promise<ProductDto[]> {
    const rows = await this.prisma.wishlists.findMany({
      where: { user_id: userId },
      include: {
        products: { include: productInclude },
      },
      orderBy: { created_at: 'desc' },
    });

    return rows.map((row) => this.productsService.serialize(row.products));
  }

  async add(userId: string, productId: string): Promise<{ message: string }> {
    const product = await this.prisma.products.findFirst({
      where: { id: productId, deleted_at: null, is_active: true },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('product not found');
    }

    const existing = await this.prisma.wishlists.findFirst({
      where: { user_id: userId, product_id: productId },
    });

    if (existing) {
      throw new ConflictException('product is already in your wishlist');
    }

    await this.prisma.wishlists.create({
      data: { user_id: userId, product_id: productId },
    });

    return { message: 'added to wishlist' };
  }

  async remove(
    userId: string,
    productId: string,
  ): Promise<{ message: string }> {
    const existing = await this.prisma.wishlists.findFirst({
      where: { user_id: userId, product_id: productId },
    });

    if (!existing) {
      throw new NotFoundException('product not found in wishlist');
    }

    await this.prisma.wishlists.delete({ where: { id: existing.id } });

    return { message: 'removed from wishlist' };
  }
}
