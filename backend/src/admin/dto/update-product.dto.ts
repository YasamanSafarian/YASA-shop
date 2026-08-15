import { concentration_enum, gender_enum } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(gender_enum, {
    message: 'gender must be one of: male, female, unisex',
  })
  gender?: gender_enum;

  @IsOptional()
  @IsEnum(concentration_enum, {
    message: 'concentration must be one of: edc, edt, edp, parfum, extrait',
  })
  concentration?: concentration_enum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  releaseYear?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  seasons?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  occasions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
