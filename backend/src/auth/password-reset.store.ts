import { Injectable } from '@nestjs/common';

interface StoredPasswordReset {
  userId: string;
  tokenHash: string;
  expiresAt: number;
}

@Injectable()
export class PasswordResetStore {
  private readonly store = new Map<string, StoredPasswordReset>();

  save(resetId: string, userId: string, tokenHash: string, expiresAt: number): void {
    this.store.set(resetId, { userId, tokenHash, expiresAt });
  }

  /** Returns the stored entry if it exists, is not expired, and matches the hash. */
  consume(resetId: string, tokenHash: string): StoredPasswordReset | null {
    const entry = this.store.get(resetId);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt <= Date.now() || entry.tokenHash !== tokenHash) {
      this.store.delete(resetId);
      return null;
    }
    this.store.delete(resetId);
    return entry;
  }
}
