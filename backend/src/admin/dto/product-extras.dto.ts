import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateImageDto {
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;
}

export class UpdateProductNotesDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  topNoteIds!: string[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  middleNoteIds!: string[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  baseNoteIds!: string[];
}
