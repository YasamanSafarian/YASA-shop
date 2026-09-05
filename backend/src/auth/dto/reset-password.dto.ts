import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(3, { message: 'identifier must be an email or phone number' })
  identifier!: string;

  @IsString()
  resetId!: string;

  @IsString()
  token!: string;

  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @MaxLength(72)
  newPassword!: string;
}
