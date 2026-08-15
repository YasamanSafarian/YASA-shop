import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async createBrand(dto: CreateBrandDto) {
    return this.prisma.brands.create({
      data: {
        name: dto.name,
        slug: dto.slug ?? slugify(dto.name),
        logo_url: dto.logoUrl,
        is_active: dto.isActive ?? true,
      },
    });
  }

  async updateBrand(id: string, dto: UpdateBrandDto) {
    await this.findBrand(id);

    return this.prisma.brands.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.logoUrl !== undefined && { logo_url: dto.logoUrl }),
        ...(dto.isActive !== undefined && { is_active: dto.isActive }),
      },
    });
  }

  async removeBrand(id: string): Promise<{ message: string }> {
    await this.findBrand(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.products.updateMany({
        where: { brand_id: id, deleted_at: null },
        data: { deleted_at: new Date(), is_active: false },
      });
      await tx.brands.update({
        where: { id },
        data: { deleted_at: new Date(), is_active: false },
      });
    });

    return { message: 'brand deleted' };
  }

  async createCategory(dto: CreateCategoryDto) {
    if (dto.parentId) {
      await this.findCategory(dto.parentId);
    }

    return this.prisma.categories.create({
      data: {
        name: dto.name,
        slug: dto.slug ?? slugify(dto.name),
        parent_id: dto.parentId,
        image_url: dto.imageUrl,
        sort_order: dto.sortOrder ?? 0,
        is_active: dto.isActive ?? true,
      },
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.findCategory(id);

    if (dto.parentId) {
      await this.findCategory(dto.parentId);
    }

    return this.prisma.categories.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.parentId !== undefined && { parent_id: dto.parentId }),
        ...(dto.imageUrl !== undefined && { image_url: dto.imageUrl }),
        ...(dto.sortOrder !== undefined && { sort_order: dto.sortOrder }),
        ...(dto.isActive !== undefined && { is_active: dto.isActive }),
      },
    });
  }

  async removeCategory(id: string): Promise<{ message: string }> {
    await this.findCategory(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.categories.updateMany({
        where: { parent_id: id, deleted_at: null },
        data: { deleted_at: new Date(), is_active: false },
      });
      await tx.categories.update({
        where: { id },
        data: { deleted_at: new Date(), is_active: false },
      });
    });

    return { message: 'category deleted' };
  }

  private async findBrand(id: string) {
    const brand = await this.prisma.brands.findFirst({
      where: { id, deleted_at: null },
    });

    if (!brand) {
      throw new NotFoundException('brand not found');
    }

    return brand;
  }

  private async findCategory(id: string) {
    const category = await this.prisma.categories.findFirst({
      where: { id, deleted_at: null },
    });

    if (!category) {
      throw new NotFoundException('category not found');
    }

    return category;
  }
}
