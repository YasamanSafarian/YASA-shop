import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ListProductsQueryDto } from './dto/list-products.query';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query() query: ListProductsQueryDto) {
    return this.productsService.list(query);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
