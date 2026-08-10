import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3, { message: 'identifier must be an email or phone number' })
  identifier!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
