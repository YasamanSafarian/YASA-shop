import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenStore } from './refresh-token.store';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [JwtModule.register({ global: true }), OtpModule],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenStore, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}