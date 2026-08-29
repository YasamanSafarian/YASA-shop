import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderExpiryService } from './order-expiry.service';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderExpiryService],
})
export class OrdersModule {}
