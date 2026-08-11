import { ProductsService } from './products.service';
import { ListProductsQueryDto } from './dto/list-products.query';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(query: ListProductsQueryDto): Promise<import("./products.service").PaginatedProducts>;
    detail(slug: string): Promise<import("./products.service").ProductDto>;
}
