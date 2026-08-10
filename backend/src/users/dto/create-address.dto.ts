import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  receiverName!: string;

  @IsString()
  @Matches(/^[0-9+\- ]{6,20}$/, {
    message:
      'receiverPhone must contain only digits, +, - and spaces (6-20 characters)',
  })
  receiverPhone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  province!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @IsString()
  @Matches(/^[0-9a-zA-Z\- ]{3,20}$/, {
    message: 'postalCode must be 3-20 alphanumeric characters',
  })
  postalCode!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
