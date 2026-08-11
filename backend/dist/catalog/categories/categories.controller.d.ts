import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    tree(): Promise<import("./categories.service").CategoryNode[]>;
}
