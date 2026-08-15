import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminOrdersService } from './admin-orders.service';
import { AdminUpdatePaymentStatusDto } from './dto/update-payment-status.dto';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminPaymentsController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdatePaymentStatusDto,
  ) {
    return this.adminOrdersService.updatePaymentStatus(id, dto);
  }
}
