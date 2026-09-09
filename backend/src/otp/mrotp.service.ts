import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const MROTP_BASE_URL = 'https://my.mrotp.ir/api/OTP/v1';

export interface SendOtpResult {
  ok: boolean;
  code: string | number;
  message: string;
  otp?: string;
  ussd?: string;
}

export interface VerifyOtpResult {
  ok: boolean;
  code: string | number;
  message: string;
}

/**
 * Thin client for the MrOTP.ir USSD & SMS OTP service.
 * Endpoints: https://my.mrotp.ir/api/OTP/v1/{setRandomOTP, verifyOTP, ...}
 */
@Injectable()
export class MrotpService {
  private readonly logger = new Logger(MrotpService.name);

  constructor(private readonly configService: ConfigService) {}

  private get apiKey(): string {
    const key = this.configService.get<string>('mrotp.apiKey');
    if (!key) {
      throw new ServiceUnavailableException('SMS service is not configured');
    }
    return key;
  }

  /**
   * Asks MrOTP to generate a random code and deliver it to the mobile via SMS.
   * The code itself is returned by the provider so we could store it, but we
   * deliberately only use verifyOTP server-side.
   */
  async sendOtp(mobile: string, validTimeMinutes = 3): Promise<SendOtpResult> {
    const body = new URLSearchParams();
    body.set('apiKey', this.apiKey);
    body.set('mobile', this.normalizeMobile(mobile));
    body.set('length', '5');
    body.set('validTime', String(validTimeMinutes));
    body.set('type', 'SMS');

    return this.request<SendOtpResult>('setRandomOTP', body, (data) => {
      const ok = Number(data.code) > 100;
      if (!ok) {
        this.logger.warn(
          `setRandomOTP failed: code=${data.code} message=${data.message ?? ''}`,
        );
      }
      return {
        ok,
        code: data.code,
        message: data.message ?? '',
        otp: data.OTP,
        ussd: data.USSD,
      };
    });
  }

  /**
   * Server-side verification of the OTP entered by the user against MrOTP.
   */
  async verifyOtp(mobile: string, otp: string): Promise<VerifyOtpResult> {
    const body = new URLSearchParams();
    body.set('apiKey', this.apiKey);
    body.set('mobile', this.normalizeMobile(mobile));
    body.set('OTP', otp);

    return this.request<VerifyOtpResult>('verifyOTP', body, (data) => ({
      ok: data.accept === 'YES',
      code: data.code,
      message: data.message ?? '',
    }));
  }

  private normalizeMobile(mobile: string): string {
    let m = mobile.trim();
    if (m.startsWith('+')) {
      m = m.slice(1);
    }
    if (m.startsWith('98')) {
      m = `0${m.slice(2)}`;
    }
    if (!/^09\d{9}$/.test(m)) {
      throw new BadRequestException('phone number must be a valid Iranian mobile');
    }
    return m;
  }

  private async request<T>(
    endpoint: string,
    body: URLSearchParams,
    map: (data: any) => T,
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${MROTP_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      throw new ServiceUnavailableException('SMS service is unreachable');
    }

    if (response.status >= 500) {
      throw new ServiceUnavailableException('SMS service error');
    }

    const data = await response.json().catch(() => ({}));
    if (typeof data?.code !== 'number' && typeof data?.code !== 'string') {
      throw new BadGatewayException('invalid response from SMS service');
    }
    return map(data);
  }
}