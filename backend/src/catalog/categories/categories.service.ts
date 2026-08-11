import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  children: CategoryNode[];
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async tree(): Promise<CategoryNode[]> {
    const categories = await this.prisma.categories.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    });

    const nodes = new Map<string, CategoryNode>();
    for (const category of categories) {
      nodes.set(category.id, {
        id: category.id,
        name: category.name,
        slug: category.slug,
        imageUrl: category.image_url,
        sortOrder: category.sort_order,
        children: [],
      });
    }

    const roots: CategoryNode[] = [];
    for (const category of categories) {
      const node = nodes.get(category.id)!;
      if (category.parent_id && nodes.has(category.parent_id)) {
        nodes.get(category.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
