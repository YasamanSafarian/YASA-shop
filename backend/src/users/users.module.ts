import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController, AddressesController],
  providers: [UsersService, AddressesService],
})
export class UsersModule {}
