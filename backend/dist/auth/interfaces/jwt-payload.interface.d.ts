export interface JwtPayload {
    sub: string;
    email?: string | null;
    phone?: string;
    role: string;
    jti?: string;
}
