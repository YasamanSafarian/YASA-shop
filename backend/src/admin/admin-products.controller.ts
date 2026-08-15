import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminProductsService } from './admin-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ListAdminProductsQueryDto } from './dto/list-admin-products.query';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  list(@Query() query: ListAdminProductsQueryDto) {
    return this.adminProductsService.list(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProductDto) {
    return this.adminProductsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.adminProductsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminProductsService.remove(id);
  }

  @Post(':id/variants')
  @HttpCode(HttpStatus.CREATED)
  addVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.adminProductsService.addVariant(id, dto);
  }

  @Patch('variants/:variantId/stock')
  updateStock(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.adminProductsService.updateStock(variantId, dto);
  }

  @Patch('variants/:variantId')
  updateVariant(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.adminProductsService.updateVariant(variantId, dto);
  }

  @Delete('variants/:variantId')
  removeVariant(@Param('variantId', ParseUUIDPipe) variantId: string) {
    return this.adminProductsService.removeVariant(variantId);
  }
}
