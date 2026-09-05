import { ConfigService } from '@nestjs/config';
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
export declare class MrotpService {
    private readonly configService;
    constructor(configService: ConfigService);
    private get apiKey();
    sendOtp(mobile: string, validTimeMinutes?: number): Promise<SendOtpResult>;
    verifyOtp(mobile: string, otp: string): Promise<VerifyOtpResult>;
    private normalizeMobile;
    private request;
}
