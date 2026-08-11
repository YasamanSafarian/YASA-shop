import { BrandsService } from './brands.service';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsService);
    list(): Promise<import("./brands.service").BrandDto[]>;
    detail(slug: string): Promise<import("./brands.service").BrandDetailDto>;
}
