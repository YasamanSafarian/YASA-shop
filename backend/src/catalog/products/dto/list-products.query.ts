import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { gender_enum, product_type_enum } from '@prisma/client';

export type SortOption =
  'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
export type AvailabilityOption = 'in_stock';

export class ListProductsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  category?: string;

  @IsOptional()
  @IsEnum(gender_enum)
  gender?: gender_enum;

  @IsOptional()
  @IsEnum(product_type_enum)
  type?: product_type_enum;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fragranceFamily?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsIn(['in_stock'])
  availability?: AvailabilityOption;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  discounted?: boolean;

  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'])
  sort?: SortOption;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
