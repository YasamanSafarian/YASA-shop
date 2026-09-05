import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  sessionId!: string;

  @IsString()
  @MinLength(3, { message: 'verification code must be at least 3 digits' })
  @MaxLength(8)
  otp!: string;
}