import {
  order_status_enum,
  payment_status_enum,
  shipment_status_enum,
} from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsEnum(order_status_enum, {
    message:
      'orderStatus must be one of: pending, paid, packing, shipped, delivered, cancelled, returned',
  })
  orderStatus?: order_status_enum;

  @IsOptional()
  @IsEnum(payment_status_enum, {
    message: 'paymentStatus must be one of: pending, paid, failed, refunded',
  })
  paymentStatus?: payment_status_enum;

  @IsOptional()
  @IsEnum(shipment_status_enum, {
    message:
      'shipmentStatus must be one of: pending, ready, sent, delivered, returned',
  })
  shipmentStatus?: shipment_status_enum;
}
