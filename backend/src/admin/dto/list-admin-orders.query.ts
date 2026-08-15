import {
  order_status_enum,
  payment_status_enum,
  shipment_status_enum,
} from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListAdminOrdersQueryDto {
  @IsOptional()
  @IsEnum(order_status_enum)
  orderStatus?: order_status_enum;

  @IsOptional()
  @IsEnum(payment_status_enum)
  paymentStatus?: payment_status_enum;

  @IsOptional()
  @IsEnum(shipment_status_enum)
  shipmentStatus?: shipment_status_enum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
