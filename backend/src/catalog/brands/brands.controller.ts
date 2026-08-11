import { Controller, Get, Param } from '@nestjs/common';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  list() {
    return this.brandsService.list();
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }
}
