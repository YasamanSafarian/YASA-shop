import { payment_method_enum } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class PayOrderDto {
  @IsEnum(payment_method_enum, { message: 'method must be: cod' })
  method!: payment_method_enum;
}
