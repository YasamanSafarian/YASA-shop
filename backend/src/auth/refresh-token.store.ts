import { Injectable } from '@nestjs/common';

interface StoredRefreshToken {
  userId: string;
  expiresAt: number;
}

@Injectable()
export class RefreshTokenStore {
  private readonly store = new Map<string, StoredRefreshToken>();

  save(token: string, userId: string, expiresAt: number): void {
    this.store.set(token, { userId, expiresAt });
  }

  has(token: string): boolean {
    const entry = this.store.get(token);
    if (!entry) {
      return false;
    }
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(token);
      return false;
    }
    return true;
  }

  delete(token: string): void {
    this.store.delete(token);
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [token, entry] of this.store) {
      if (entry.expiresAt <= now) {
        this.store.delete(token);
      }
    }
  }
}
