import { Injectable, signal } from '@angular/core';

export type ToastType = 'error' | 'success' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastSignal = signal<Toast | null>(null);
  readonly toast = this.toastSignal.asReadonly();

  private timer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: ToastType = 'info'): void {
    this.toastSignal.set({ message, type });
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.toastSignal.set(null), 3000);
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  dismiss(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.toastSignal.set(null);
  }
}
