import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ListProductsQueryDto } from './dto/list-products.query';

export const productInclude = {
  brands: true,
  product_categories: { include: { categories: true } },
  product_variants: {
    where: { is_active: true, deleted_at: null },
    orderBy: { price: 'asc' },
    include: { product_images: true },
  },
  product_notes: { include: { notes: true } },
  product_fragrance_families: { include: { fragrance_families: true } },
} satisfies Prisma.productsInclude;

export type ProductWithRelations = Prisma.productsGetPayload<{
  include: typeof productInclude;
}>;

export interface ProductVariantDto {
  id: string;
  sku: string;
  barcode: string | null;
  format: string;
  volumeMl: number;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  weight: number | null;
  isDefault: boolean;
  isActive: boolean;
  images: {
    id: string;
    imageUrl: string;
    altText: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  gender: string | null;
  concentration: string | null;
  releaseYear: number | null;
  seasons: string[];
  occasions: string[];
  brand: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  categories: { id: string; name: string; slug: string }[];
  variants: ProductVariantDto[];
  notes: { top: string[]; middle: string[]; base: string[] };
  fragranceFamilies: { id: string; name: string; slug: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  data: ProductDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListProductsQueryDto): Promise<PaginatedProducts> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = await this.buildWhere(query);

    const [matching, variantGroups] = await Promise.all([
      this.prisma.products.findMany({
        where,
        select: { id: true, name: true, created_at: true },
      }),
      this.prisma.product_variants.groupBy({
        by: ['product_id'],
        where: { is_active: true, deleted_at: null },
        _min: { price: true },
      }),
    ]);

    const minPrice = new Map(
      variantGroups.map((group) => [
        group.product_id,
        Number(group._min.price ?? 0),
      ]),
    );

    const sorted = [...matching].sort((a, b) => {
      switch (query.sort) {
        case 'price_asc':
          return (
            (minPrice.get(a.id) ?? Infinity) - (minPrice.get(b.id) ?? Infinity)
          );
        case 'price_desc':
          return (
            (minPrice.get(b.id) ?? -Infinity) -
            (minPrice.get(a.id) ?? -Infinity)
          );
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return b.created_at.getTime() - a.created_at.getTime();
      }
    });

    const total = sorted.length;
    const pageIds = sorted
      .slice((page - 1) * limit, page * limit)
      .map((product) => product.id);

    const items =
      pageIds.length > 0
        ? await this.prisma.products.findMany({
            where: { id: { in: pageIds } },
            include: productInclude,
          })
        : [];

    const itemsById = new Map(items.map((item) => [item.id, item]));
    const ordered = pageIds
      .map((id) => itemsById.get(id))
      .filter(
        (product): product is ProductWithRelations => product !== undefined,
      );

    return {
      data: ordered.map((product) => this.serialize(product)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string): Promise<ProductDto> {
    const product = await this.prisma.products.findFirst({
      where: { slug, deleted_at: null, is_active: true },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException('product not found');
    }

    return this.serialize(product);
  }

  async listByBrand(brandId: string): Promise<ProductDto[]> {
    const products = await this.prisma.products.findMany({
      where: { brand_id: brandId, deleted_at: null, is_active: true },
      include: productInclude,
      orderBy: { created_at: 'desc' },
    });

    return products.map((product) => this.serialize(product));
  }

  serialize(product: ProductWithRelations): ProductDto {
    const notes: ProductDto['notes'] = { top: [], middle: [], base: [] };
    for (const productNote of product.product_notes) {
      notes[productNote.note_type].push(productNote.notes.name);
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      gender: product.gender,
      concentration: product.concentration,
      releaseYear: product.release_year,
      seasons: product.seasons,
      occasions: product.occasions,
      brand: {
        id: product.brands.id,
        name: product.brands.name,
        slug: product.brands.slug,
        logoUrl: product.brands.logo_url,
      },
      categories: product.product_categories.map((pc) => ({
        id: pc.categories.id,
        name: pc.categories.name,
        slug: pc.categories.slug,
      })),
      variants: product.product_variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        barcode: variant.barcode,
        format: variant.format,
        volumeMl: variant.volume_ml,
        price: Number(variant.price),
        compareAtPrice:
          variant.compare_at_price !== null
            ? Number(variant.compare_at_price)
            : null,
        stockQuantity: variant.stock_quantity,
        weight: variant.weight,
        isDefault: variant.is_default,
        isActive: variant.is_active,
        images: variant.product_images.map((image) => ({
          id: image.id,
          imageUrl: image.image_url,
          altText: image.alt_text,
          sortOrder: image.sort_order,
          isPrimary: image.is_primary,
        })),
      })),
      notes,
      fragranceFamilies: product.product_fragrance_families.map((pf) => ({
        id: pf.fragrance_families.id,
        name: pf.fragrance_families.name,
        slug: pf.fragrance_families.slug,
      })),
      createdAt: product.created_at.toISOString(),
      updatedAt: product.updated_at.toISOString(),
    };
  }

  private async buildWhere(
    query: ListProductsQueryDto,
  ): Promise<Prisma.productsWhereInput> {
    const where: Prisma.productsWhereInput = {
      deleted_at: null,
      is_active: true,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { brands: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.brand) {
      where.brands = { slug: query.brand };
    }

    if (query.category) {
      const categoryIds = await this.resolveCategoryAndDescendants(
        query.category,
      );
      where.product_categories = {
        some: { category_id: { in: categoryIds } },
      };
    }

    if (query.gender) {
      where.gender = query.gender;
    }

    const variantWhere: Prisma.product_variantsWhereInput = {
      is_active: true,
      deleted_at: null,
    };
    if (query.minPrice !== undefined) {
      variantWhere.price = { gte: query.minPrice };
    }
    if (query.maxPrice !== undefined) {
      variantWhere.price = {
        ...(variantWhere.price as object | undefined),
        lte: query.maxPrice,
      };
    }
    if (query.availability === 'in_stock') {
      variantWhere.stock_quantity = { gt: 0 };
    }

    if (
      query.minPrice !== undefined ||
      query.maxPrice !== undefined ||
      query.availability === 'in_stock'
    ) {
      where.product_variants = { some: variantWhere };
    }

    return where;
  }

  private async resolveCategoryAndDescendants(slug: string): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      WITH RECURSIVE category_tree AS (
        SELECT id
        FROM categories
        WHERE slug = ${slug} AND deleted_at IS NULL AND is_active = true
        UNION ALL
        SELECT c.id
        FROM categories c
        INNER JOIN category_tree t ON c.parent_id = t.id
        WHERE c.deleted_at IS NULL AND c.is_active = true
      )
      SELECT id FROM category_tree
    `;

    return rows.map((row) => row.id);
  }
}
