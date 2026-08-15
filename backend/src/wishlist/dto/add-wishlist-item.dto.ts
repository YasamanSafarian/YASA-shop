import { IsUUID } from 'class-validator';

export class AddWishlistItemDto {
  @IsUUID()
  productId!: string;
}
