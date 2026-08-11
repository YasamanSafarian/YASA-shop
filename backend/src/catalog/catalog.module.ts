import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [ProductsModule, BrandsModule, CategoriesModule],
})
export class CatalogModule {}
