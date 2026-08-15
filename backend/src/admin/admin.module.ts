import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminProductsController } from './admin-products.controller';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { AdminReviewsController } from './admin-reviews.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsService } from './admin-products.service';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminReviewsService } from './admin-reviews.service';

@Module({
  imports: [AuthModule],
  controllers: [
    AdminOrdersController,
    AdminProductsController,
    AdminCatalogController,
    AdminPaymentsController,
    AdminReviewsController,
  ],
  providers: [
    AdminOrdersService,
    AdminProductsService,
    AdminCatalogService,
    AdminReviewsService,
  ],
})
export class AdminModule {}
