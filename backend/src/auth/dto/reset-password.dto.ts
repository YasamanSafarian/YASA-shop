import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  sessionId!: string;

  @IsString()
  @MinLength(3, { message: 'verification code must be at least 3 digits' })
  @MaxLength(8)
  otp!: string;

  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @MaxLength(72)
  newPassword!: string;
}