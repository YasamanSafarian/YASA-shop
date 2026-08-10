import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  receiverName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\- ]{6,20}$/, {
    message:
      'receiverPhone must contain only digits, +, - and spaces (6-20 characters)',
  })
  receiverPhone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  province?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-zA-Z\- ]{3,20}$/, {
    message: 'postalCode must be 3-20 alphanumeric characters',
  })
  postalCode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
