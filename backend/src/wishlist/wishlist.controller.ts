import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.wishlistService.list(user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  add(@CurrentUser() user: JwtPayload, @Body() dto: AddWishlistItemDto) {
    return this.wishlistService.add(user.sub, dto.productId);
  }

  @Delete(':productId')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.wishlistService.remove(user.sub, productId);
  }
}
