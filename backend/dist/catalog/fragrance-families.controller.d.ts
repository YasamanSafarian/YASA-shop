import { PrismaService } from '../database/prisma.service';
export declare class FragranceFamiliesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        name: string;
        id: string;
        slug: string;
    }[]>;
}
