export type OtpPurpose = 'reset-password' | 'register';
export interface RegisterPending {
    email: string | null;
    passwordHash: string;
    firstName: string | null;
    lastName: string | null;
}
export interface OtpSession {
    phone: string;
    purpose: OtpPurpose;
    userId?: string;
    pending?: RegisterPending;
    expiresAt: number;
}
export declare class OtpSessionStore {
    private readonly store;
    save(sessionId: string, session: OtpSession): void;
    get(sessionId: string): OtpSession | null;
    consume(sessionId: string): OtpSession | null;
}
