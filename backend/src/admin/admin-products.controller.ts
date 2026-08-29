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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
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
import { UpdateImageDto, UpdateProductNotesDto } from './dto/product-extras.dto';
import { UpdateProductFamiliesDto } from './dto/extras.dto';

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

  /* ── Images ── */

  @Post('variants/:variantId/images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (_req, file, cb) => {
          const unique = randomUUID();
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${unique}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
        if (!allowed.test(extname(file.originalname))) {
          cb(new Error('Only image files are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  addImage(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @UploadedFile() file: any,
  ) {
    return this.adminProductsService.addImage(variantId, file);
  }

  @Patch('images/:imageId')
  updateImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() dto: UpdateImageDto,
  ) {
    return this.adminProductsService.updateImage(imageId, dto);
  }

  @Delete('images/:imageId')
  removeImage(@Param('imageId', ParseUUIDPipe) imageId: string) {
    return this.adminProductsService.removeImage(imageId);
  }

  /* ── Notes ── */

  @Patch(':id/notes')
  updateNotes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductNotesDto,
  ) {
    return this.adminProductsService.updateNotes(id, dto);
  }

  /* ── Fragrance families ── */

  @Patch(':id/fragrance-families')
  updateFragranceFamilies(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductFamiliesDto,
  ) {
    return this.adminProductsService.updateFragranceFamilies(id, dto);
  }
}
