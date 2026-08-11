import { PrismaService } from '../../database/prisma.service';
export interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    sortOrder: number;
    children: CategoryNode[];
}
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    tree(): Promise<CategoryNode[]>;
}
