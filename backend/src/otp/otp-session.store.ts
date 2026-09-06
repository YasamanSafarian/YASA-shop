import { Injectable } from '@nestjs/common';

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

/**
 * In-memory store for pending OTP verifications. Each session is keyed by a
 * random session id returned to the client. It mirrors RefreshTokenStore's
 * approach and is fine for the single-instance MVP backend.
 */
@Injectable()
export class OtpSessionStore {
  private readonly store = new Map<string, OtpSession>();

  save(sessionId: string, session: OtpSession): void {
    this.store.set(sessionId, session);
  }

  /** Returns the session if it exists and is not yet expired. */
  get(sessionId: string): OtpSession | null {
    const session = this.store.get(sessionId);
    if (!session) {
      return null;
    }
    if (session.expiresAt <= Date.now()) {
      this.store.delete(sessionId);
      return null;
    }
    return session;
  }

  /** Consumes (deletes) a session so it cannot be reused. */
  consume(sessionId: string): OtpSession | null {
    const session = this.get(sessionId);
    if (session) {
      this.store.delete(sessionId);
    }
    return session;
  }
}