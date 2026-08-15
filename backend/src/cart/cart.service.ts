import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const cartInclude = {
  cart_items: {
    where: { deleted_at: null },
    orderBy: { created_at: 'asc' },
    include: {
      product_variants: {
        include: {
          products: {
            include: { brands: true },
          },
          product_images: {
            orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }],
            take: 1,
          },
        },
      },
    },
  },
} satisfies Prisma.cartsInclude;

type CartWithRelations = Prisma.cartsGetPayload<{
  include: typeof cartInclude;
}>;

export interface CartItemDto {
  id: string;
  quantity: number;
  lineTotal: number;
  variant: {
    id: string;
    sku: string;
    format: string;
    volumeMl: number;
    price: number;
    compareAtPrice: number | null;
    stockQuantity: number;
    weight: number | null;
    imageUrl: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
      gender: string | null;
      concentration: string | null;
      brand: { id: string; name: string; slug: string };
    };
  };
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  totals: {
    distinctItems: number;
    itemCount: number;
    subtotal: number;
  };
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string): Promise<CartDto> {
    const cart = await this.getOrCreateCart(userId);
    return this.serialize(await this.loadCart(cart.id));
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartDto> {
    const variant = await this.prisma.product_variants.findFirst({
      where: {
        id: dto.variantId,
        deleted_at: null,
        is_active: true,
        products: { is_active: true, deleted_at: null },
      },
    });

    if (!variant) {
      throw new NotFoundException('variant not found');
    }

    const cart = await this.getOrCreateCart(userId);
    const quantity = dto.quantity ?? 1;

    const existing = await this.prisma.cart_items.findFirst({
      where: { cart_id: cart.id, variant_id: dto.variantId },
    });

    if (existing) {
      const newQuantity = existing.deleted_at
        ? quantity
        : existing.quantity + quantity;
      this.assertStock(variant, newQuantity);

      await this.prisma.cart_items.update({
        where: { id: existing.id },
        data: {
          quantity: newQuantity,
          deleted_at: null,
          updated_at: new Date(),
        },
      });
    } else {
      this.assertStock(variant, quantity);

      await this.prisma.cart_items.create({
        data: {
          cart_id: cart.id,
          variant_id: dto.variantId,
          quantity,
        },
      });
    }

    return this.serialize(await this.loadCart(cart.id));
  }

  async updateItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartDto> {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.findItem(cart.id, itemId);
    const variant = item.product_variants;

    if (variant.deleted_at !== null || !variant.is_active) {
      throw new NotFoundException('cart item not found');
    }

    this.assertStock(variant, dto.quantity);

    await this.prisma.cart_items.update({
      where: { id: itemId },
      data: { quantity: dto.quantity, updated_at: new Date() },
    });

    return this.serialize(await this.loadCart(cart.id));
  }

  async removeItem(
    userId: string,
    itemId: string,
  ): Promise<{ message: string }> {
    const cart = await this.getOrCreateCart(userId);
    await this.findItem(cart.id, itemId);

    await this.prisma.cart_items.update({
      where: { id: itemId },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });

    return { message: 'cart item removed' };
  }

  async clear(userId: string): Promise<{ message: string }> {
    const cart = await this.prisma.carts.findFirst({
      where: { user_id: userId, deleted_at: null },
    });

    if (!cart) {
      return { message: 'cart cleared' };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.cart_items.updateMany({
        where: { cart_id: cart.id, deleted_at: null },
        data: { deleted_at: new Date(), updated_at: new Date() },
      });

      await tx.carts.update({
        where: { id: cart.id },
        data: { deleted_at: new Date(), updated_at: new Date() },
      });
    });

    return { message: 'cart cleared' };
  }

  serialize(cart: CartWithRelations): CartDto {
    const items = cart.cart_items.map((item) => {
      const variant = item.product_variants;
      const product = variant.products;
      const price = Number(variant.price);

      return {
        id: item.id,
        quantity: item.quantity,
        lineTotal: price * item.quantity,
        variant: {
          id: variant.id,
          sku: variant.sku,
          format: variant.format,
          volumeMl: variant.volume_ml,
          price,
          compareAtPrice:
            variant.compare_at_price !== null
              ? Number(variant.compare_at_price)
              : null,
          stockQuantity: variant.stock_quantity,
          weight: variant.weight,
          imageUrl: variant.product_images[0]?.image_url ?? null,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            gender: product.gender,
            concentration: product.concentration,
            brand: {
              id: product.brands.id,
              name: product.brands.name,
              slug: product.brands.slug,
            },
          },
        },
      };
    });

    return {
      id: cart.id,
      items,
      totals: {
        distinctItems: items.length,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
      },
      createdAt: cart.created_at.toISOString(),
      updatedAt: cart.updated_at.toISOString(),
    };
  }

  private async getOrCreateCart(userId: string) {
    const existing = await this.prisma.carts.findFirst({
      where: { user_id: userId, deleted_at: null },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.carts.create({
      data: { user_id: userId },
    });
  }

  private async loadCart(cartId: string) {
    const cart = await this.prisma.carts.findFirst({
      where: { id: cartId, deleted_at: null },
      include: cartInclude,
    });

    if (!cart) {
      throw new NotFoundException('cart not found');
    }

    return cart;
  }

  private async findItem(cartId: string, itemId: string) {
    const item = await this.prisma.cart_items.findFirst({
      where: { id: itemId, cart_id: cartId, deleted_at: null },
      include: { product_variants: true },
    });

    if (!item) {
      throw new NotFoundException('cart item not found');
    }

    return item;
  }

  private assertStock(
    variant: { stock_quantity: number },
    quantity: number,
  ): void {
    if (variant.stock_quantity < quantity) {
      throw new BadRequestException(
        `insufficient stock: only ${variant.stock_quantity} available`,
      );
    }
  }
}
