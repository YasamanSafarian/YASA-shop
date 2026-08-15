import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminReviewsService } from './admin-reviews.service';
import { ListAdminReviewsQueryDto } from './dto/list-admin-reviews.query';
import { UpdateReviewActiveDto } from './dto/update-review-active.dto';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminReviewsController {
  constructor(private readonly adminReviewsService: AdminReviewsService) {}

  @Get()
  list(@Query() query: ListAdminReviewsQueryDto) {
    return this.adminReviewsService.list(query);
  }

  @Patch(':id')
  setActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewActiveDto,
  ) {
    return this.adminReviewsService.setActive(id, dto);
  }
}
