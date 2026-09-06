import { IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @MinLength(3, { message: 'identifier must be an email or phone number' })
  identifier!: string;
}
