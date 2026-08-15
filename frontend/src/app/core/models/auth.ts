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
