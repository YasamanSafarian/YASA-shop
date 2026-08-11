import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

@Module({
  imports: [ProductsModule],
  controllers: [BrandsController],
  providers: [BrandsService],
})
export class BrandsModule {}
