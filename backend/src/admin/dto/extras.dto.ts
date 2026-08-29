import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;
}

export class CreateFragranceFamilyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;
}

export class UpdateProductFamiliesDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  fragranceFamilyIds!: string[];
}
