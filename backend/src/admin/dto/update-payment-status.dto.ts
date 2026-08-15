import { payment_status_enum } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class AdminUpdatePaymentStatusDto {
  @IsEnum(payment_status_enum, {
    message: 'paymentStatus must be one of: pending, paid, failed, refunded',
  })
  paymentStatus!: payment_status_enum;
}
