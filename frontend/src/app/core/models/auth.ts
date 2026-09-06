export interface AuthUser {
  id: string;
  email: string | null;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  phone: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/** Response of POST /auth/register (OTP requested, account not yet created). */
export interface RegisterOtpResponse {
  sessionId: string;
  expiresInSeconds: number;
}

/** Response of POST /auth/forgot-password (OTP requested). */
export interface ForgotPasswordResponse {
  sessionId: string;
  expiresInSeconds: number;
}

export interface VerifyOtpPayload {
  sessionId: string;
  otp: string;
}

export interface ResetPasswordPayload {
  sessionId: string;
  otp: string;
  newPassword: string;
}
