import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../database/prisma.service';
import { productInclude } from '../catalog/products/products.service';
import { slugify } from '../common/utils/slugify';
import { CreateProductDto, CreateVariantDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ListAdminProductsQueryDto } from './dto/list-admin-products.query';
import { UpdateImageDto, UpdateProductNotesDto } from './dto/product-extras.dto';
import { UpdateProductFamiliesDto } from './dto/extras.dto';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListAdminProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.productsWhereInput = { deleted_at: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, products] = await Promise.all([
      this.prisma.products.count({ where }),
      this.prisma.products.findMany({
        where,
        include: {
          brands: true,
          product_categories: { include: { categories: true } },
          _count: { select: { product_variants: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: { id: product.brands.id, name: product.brands.name },
        gender: product.gender,
        concentration: product.concentration,
        categories: product.product_categories.map((pc) => ({
          id: pc.categories.id,
          name: pc.categories.name,
          slug: pc.categories.slug,
        })),
        isActive: product.is_active,
        variantCount: product._count.product_variants,
        createdAt: product.created_at.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateProductDto) {
    const brand = await this.prisma.brands.findFirst({
      where: { id: dto.brandId, deleted_at: null },
    });
    if (!brand) {
      throw new NotFoundException('brand not found');
    }

    await this.validateCategories(dto.categoryIds);

    const product = await this.prisma.products.create({
      data: {
        brand_id: dto.brandId,
        name: dto.name,
        slug: await this.uniqueSlug(dto.slug ?? slugify(dto.name)),
        description: dto.description,
        gender: dto.gender,
        concentration: dto.concentration,
        release_year: dto.releaseYear,
        seasons: dto.seasons ?? [],
        occasions: dto.occasions ?? [],
        is_active: dto.isActive ?? true,
        product_variants: dto.variants?.length
          ? { create: dto.variants.map((v) => this.mapVariant(v)) }
          : undefined,
        product_categories: dto.categoryIds?.length
          ? {
              create: dto.categoryIds.map((categoryId) => ({
                category_id: categoryId,
              })),
            }
          : undefined,
      },
      include: productInclude,
    });

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findProduct(id);

    if (dto.brandId) {
      const brand = await this.prisma.brands.findFirst({
        where: { id: dto.brandId, deleted_at: null },
      });
      if (!brand) {
        throw new NotFoundException('brand not found');
      }
    }

    if (dto.categoryIds) {
      await this.validateCategories(dto.categoryIds);
    }

    await this.prisma.products.update({
      where: { id },
      data: {
        ...(dto.brandId !== undefined && { brand_id: dto.brandId }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && {
          slug: await this.uniqueSlug(dto.slug),
        }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.concentration !== undefined && {
          concentration: dto.concentration,
        }),
        ...(dto.releaseYear !== undefined && {
          release_year: dto.releaseYear,
        }),
        ...(dto.seasons !== undefined && { seasons: dto.seasons }),
        ...(dto.occasions !== undefined && { occasions: dto.occasions }),
        ...(dto.isActive !== undefined && { is_active: dto.isActive }),
      },
    });

    if (dto.categoryIds) {
      await this.prisma.product_categories.deleteMany({
        where: { product_id: id },
      });
      if (dto.categoryIds.length) {
        await this.prisma.product_categories.createMany({
          data: dto.categoryIds.map((categoryId) => ({
            product_id: id,
            category_id: categoryId,
          })),
        });
      }
    }

    return this.prisma.products.findUnique({
      where: { id },
      include: productInclude,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findProduct(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.product_variants.updateMany({
        where: { product_id: id, deleted_at: null },
        data: { deleted_at: new Date(), is_active: false },
      });
      await tx.products.update({
        where: { id },
        data: { deleted_at: new Date(), is_active: false },
      });
    });

    return { message: 'product deleted' };
  }

  async addVariant(productId: string, dto: CreateVariantDto) {
    await this.findProduct(productId);

    return this.prisma.product_variants.create({
      data: {
        product_id: productId,
        ...this.mapVariant(dto),
      },
    });
  }

  async updateVariant(variantId: string, dto: UpdateVariantDto) {
    await this.findVariant(variantId);

    return this.prisma.product_variants.update({
      where: { id: variantId },
      data: {
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.barcode !== undefined && { barcode: dto.barcode }),
        ...(dto.format !== undefined && { format: dto.format }),
        ...(dto.volumeMl !== undefined && { volume_ml: dto.volumeMl }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.compareAtPrice !== undefined && {
          compare_at_price: dto.compareAtPrice,
        }),
        ...(dto.stockQuantity !== undefined && {
          stock_quantity: dto.stockQuantity,
        }),
        ...(dto.weight !== undefined && { weight: dto.weight }),
        ...(dto.isDefault !== undefined && { is_default: dto.isDefault }),
        ...(dto.isActive !== undefined && { is_active: dto.isActive }),
      },
    });
  }

  async removeVariant(variantId: string): Promise<{ message: string }> {
    await this.findVariant(variantId);

    await this.prisma.product_variants.update({
      where: { id: variantId },
      data: { deleted_at: new Date(), is_active: false },
    });

    return { message: 'variant deleted' };
  }

  async updateStock(variantId: string, dto: UpdateStockDto) {
    await this.findVariant(variantId);

    const variant = await this.prisma.product_variants.update({
      where: { id: variantId },
      data: { stock_quantity: dto.stockQuantity },
    });

    return {
      id: variant.id,
      sku: variant.sku,
      stockQuantity: variant.stock_quantity,
    };
  }

  /* ── Images ── */

  async addImage(variantId: string, file: any) {
    await this.findVariant(variantId);

    const imageUrl = `/uploads/products/${file.filename}`;

    const existingCount = await this.prisma.product_images.count({
      where: { variant_id: variantId },
    });

    const image = await this.prisma.product_images.create({
      data: {
        variant_id: variantId,
        image_url: imageUrl,
        alt_text: file.originalname,
        sort_order: existingCount,
        is_primary: existingCount === 0,
      },
    });

    return image;
  }

  async updateImage(imageId: string, dto: UpdateImageDto) {
    const image = await this.prisma.product_images.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException('image not found');
    }

    if (dto.isPrimary) {
      await this.prisma.product_images.updateMany({
        where: { variant_id: image.variant_id },
        data: { is_primary: false },
      });
    }

    return this.prisma.product_images.update({
      where: { id: imageId },
      data: {
        ...(dto.isPrimary !== undefined && { is_primary: dto.isPrimary }),
        ...(dto.altText !== undefined && { alt_text: dto.altText }),
      },
    });
  }

  async removeImage(imageId: string): Promise<{ message: string }> {
    const image = await this.prisma.product_images.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException('image not found');
    }

    const filePath = join(process.cwd(), image.image_url);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    await this.prisma.product_images.delete({ where: { id: imageId } });

    if (image.is_primary) {
      const next = await this.prisma.product_images.findFirst({
        where: { variant_id: image.variant_id },
        orderBy: { sort_order: 'asc' },
      });
      if (next) {
        await this.prisma.product_images.update({
          where: { id: next.id },
          data: { is_primary: true },
        });
      }
    }

    return { message: 'image deleted' };
  }

  /* ── Notes ── */

  async updateNotes(productId: string, dto: UpdateProductNotesDto) {
    await this.findProduct(productId);

    await this.prisma.$transaction(async (tx) => {
      await tx.product_notes.deleteMany({
        where: { product_id: productId },
      });

      const entries: { product_id: string; note_id: string; note_type: 'top' | 'middle' | 'base' }[] = [];

      for (const noteId of dto.topNoteIds) {
        entries.push({ product_id: productId, note_id: noteId, note_type: 'top' });
      }
      for (const noteId of dto.middleNoteIds) {
        entries.push({ product_id: productId, note_id: noteId, note_type: 'middle' });
      }
      for (const noteId of dto.baseNoteIds) {
        entries.push({ product_id: productId, note_id: noteId, note_type: 'base' });
      }

      if (entries.length) {
        await tx.product_notes.createMany({ data: entries });
      }
    });

    return { message: 'notes updated' };
  }

  /* ── Fragrance families ── */

  async updateFragranceFamilies(
    productId: string,
    dto: UpdateProductFamiliesDto,
  ) {
    await this.findProduct(productId);

    if (dto.fragranceFamilyIds.length) {
      const count = await this.prisma.fragrance_families.count({
        where: { id: { in: dto.fragranceFamilyIds } },
      });
      if (count !== dto.fragranceFamilyIds.length) {
        throw new BadRequestException('one or more fragrance families not found');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.product_fragrance_families.deleteMany({
        where: { product_id: productId },
      });

      if (dto.fragranceFamilyIds.length) {
        await tx.product_fragrance_families.createMany({
          data: dto.fragranceFamilyIds.map((fragranceFamilyId) => ({
            product_id: productId,
            fragrance_family_id: fragranceFamilyId,
          })),
        });
      }
    });

    return { message: 'fragrance families updated' };
  }

  private async findProduct(id: string) {
    const product = await this.prisma.products.findFirst({
      where: { id, deleted_at: null },
    });

    if (!product) {
      throw new NotFoundException('product not found');
    }

    return product;
  }

  private async findVariant(id: string) {
    const variant = await this.prisma.product_variants.findFirst({
      where: { id, deleted_at: null },
    });

    if (!variant) {
      throw new NotFoundException('variant not found');
    }

    return variant;
  }

  private async validateCategories(categoryIds?: string[]) {
    if (!categoryIds?.length) {
      return;
    }

    const count = await this.prisma.categories.count({
      where: { id: { in: categoryIds }, deleted_at: null },
    });

    if (count !== categoryIds.length) {
      throw new BadRequestException('one or more categories not found');
    }
  }

  private async uniqueSlug(base: string, attempt = 0): Promise<string> {
    if (attempt > 20) {
      throw new BadRequestException('could not generate a unique slug');
    }

    const slug = attempt === 0 ? base : `${base}-${attempt}`;
    const existing = await this.prisma.products.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      return this.uniqueSlug(base, attempt + 1);
    }

    return slug;
  }

  private mapVariant(dto: CreateVariantDto) {
    return {
      sku: dto.sku,
      barcode: dto.barcode,
      format: dto.format,
      volume_ml: dto.volumeMl,
      price: dto.price,
      compare_at_price: dto.compareAtPrice,
      stock_quantity: dto.stockQuantity ?? 0,
      weight: dto.weight,
      is_default: dto.isDefault ?? false,
      is_active: dto.isActive ?? true,
    };
  }
}
