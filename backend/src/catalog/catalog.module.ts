import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { FragranceFamiliesController } from './fragrance-families.controller';

@Module({
  imports: [ProductsModule, BrandsModule, CategoriesModule],
  controllers: [FragranceFamiliesController],
})
export class CatalogModule {}
