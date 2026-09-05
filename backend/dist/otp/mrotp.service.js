"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MrotpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const MROTP_BASE_URL = 'https://my.mrotp.ir/api/OTP/v1';
let MrotpService = class MrotpService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    get apiKey() {
        const key = this.configService.get('mrotp.apiKey');
        if (!key) {
            throw new common_1.ServiceUnavailableException('SMS service is not configured');
        }
        return key;
    }
    async sendOtp(mobile, validTimeMinutes = 3) {
        const body = new URLSearchParams();
        body.set('apiKey', this.apiKey);
        body.set('mobile', this.normalizeMobile(mobile));
        body.set('length', '5');
        body.set('validTime', String(validTimeMinutes));
        body.set('type', 'SMS');
        return this.request('setRandomOTP', body, (data) => {
            const ok = Number(data.code) > 100;
            return {
                ok,
                code: data.code,
                message: data.message ?? '',
                otp: data.OTP,
                ussd: data.USSD,
            };
        });
    }
    async verifyOtp(mobile, otp) {
        const body = new URLSearchParams();
        body.set('apiKey', this.apiKey);
        body.set('mobile', this.normalizeMobile(mobile));
        body.set('OTP', otp);
        return this.request('verifyOTP', body, (data) => ({
            ok: data.accept === 'YES',
            code: data.code,
            message: data.message ?? '',
        }));
    }
    normalizeMobile(mobile) {
        let m = mobile.trim();
        if (m.startsWith('+')) {
            m = m.slice(1);
        }
        if (m.startsWith('98')) {
            m = `0${m.slice(2)}`;
        }
        if (!/^09\d{9}$/.test(m)) {
            throw new common_1.BadRequestException('phone number must be a valid Iranian mobile');
        }
        return m;
    }
    async request(endpoint, body, map) {
        let response;
        try {
            response = await fetch(`${MROTP_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
                signal: AbortSignal.timeout(8000),
            });
        }
        catch {
            throw new common_1.ServiceUnavailableException('SMS service is unreachable');
        }
        if (response.status >= 500) {
            throw new common_1.ServiceUnavailableException('SMS service error');
        }
        const data = await response.json().catch(() => ({}));
        if (typeof data?.code !== 'number' && typeof data?.code !== 'string') {
            throw new common_1.BadGatewayException('invalid response from SMS service');
        }
        return map(data);
    }
};
exports.MrotpService = MrotpService;
exports.MrotpService = MrotpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MrotpService);
//# sourceMappingURL=mrotp.service.js.map