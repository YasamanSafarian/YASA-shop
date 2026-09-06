import { Module } from '@nestjs/common';
import { MrotpService } from './mrotp.service';
import { OtpSessionStore } from './otp-session.store';

@Module({
  providers: [MrotpService, OtpSessionStore],
  exports: [MrotpService, OtpSessionStore],
})
export class OtpModule {}