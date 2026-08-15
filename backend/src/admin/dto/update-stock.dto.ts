import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateStockDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity!: number;
}
