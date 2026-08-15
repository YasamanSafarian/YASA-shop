import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { AuthUser, RegisterPayload, TokenResponse } from '../models/auth';

const ACCESS_TOKEN_KEY = 'yasa.access_token';
const REFRESH_TOKEN_KEY = 'yasa.refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly refreshTokenSignal = signal<string | null>(null);

  readonly user = this.userSignal.asReadonly();
  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  private refreshing: Promise<boolean> | null = null;

  /** Called once at application startup (APP_INITIALIZER). */
  async restore(): Promise<void> {
    this.loadTokens();
    if (!this.accessTokenSignal()) {
      return;
    }

    try {
      const user = await firstValueFrom(this.api.get<AuthUser>('/auth/me'));
      this.userSignal.set(user);
    } catch {
      const refreshed = await this.refresh();
      if (!refreshed) {
        this.clearSession();
      }
    }
  }

  async login(identifier: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.api.post<TokenResponse>('/auth/login', { identifier, password }),
    );
    this.applyTokens(response);
  }

  async register(payload: RegisterPayload): Promise<void> {
    const response = await firstValueFrom(
      this.api.post<TokenResponse>('/auth/register', payload),
    );
    this.applyTokens(response);
  }

  async logout(): Promise<void> {
    const refreshToken = this.refreshTokenSignal();
    if (refreshToken) {
      try {
        await firstValueFrom(
          this.api.post<{ message: string }>('/auth/logout', { refreshToken }),
        );
      } catch {
        // Local session is cleared regardless of backend result.
      }
    }
    this.clearSession();
  }

  /**
   * Single-flight refresh. Returns true when a fresh access token was
   * obtained, false when the session could not be restored.
   */
  refresh(): Promise<boolean> {
    if (!this.refreshing) {
      this.refreshing = this.doRefresh().finally(() => {
        this.refreshing = null;
      });
    }
    return this.refreshing;
  }

  clearSession(): void {
    this.userSignal.set(null);
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private async doRefresh(): Promise<boolean> {
    const refreshToken = this.refreshTokenSignal();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.api.post<TokenResponse>('/auth/refresh', { refreshToken }),
      );
      this.applyTokens(response);
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  private applyTokens(response: TokenResponse): void {
    this.accessTokenSignal.set(response.accessToken);
    this.refreshTokenSignal.set(response.refreshToken);
    this.userSignal.set(response.user);
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
  }

  private loadTokens(): void {
    this.accessTokenSignal.set(localStorage.getItem(ACCESS_TOKEN_KEY));
    this.refreshTokenSignal.set(localStorage.getItem(REFRESH_TOKEN_KEY));
  }
}
