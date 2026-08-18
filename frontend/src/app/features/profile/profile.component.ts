import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { TranslateService } from '../../core/services/translate.service';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';
import { Order } from '../../core/models/order';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, UiButtonComponent, UiStateComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly orderService = inject(OrderService);
  readonly translate = inject(TranslateService);

  readonly cancellingId = signal<string | null>(null);
  readonly expandedId = signal<string | null>(null);

  get user() {
    return this.auth.user();
  }

  get displayName(): string {
    if (!this.user) return '';
    return (
      [this.user.firstName, this.user.lastName].filter(Boolean).join(' ') ||
      this.user.phone
    );
  }

  initials(): string {
    const u = this.auth.user();
    if (!u) return '';
    const f = u.firstName?.[0] ?? '';
    const l = u.lastName?.[0] ?? '';
    return (f + l).toUpperCase() || u.phone.slice(-2);
  }

  ngOnInit(): void {
    this.orderService.load();
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-US');
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  async cancelOrder(order: Order): Promise<void> {
    this.cancellingId.set(order.id);
    try {
      await this.orderService.cancel(order.id);
    } catch {
      // handled by interceptor
    } finally {
      this.cancellingId.set(null);
    }
  }

  statusLabel(status: string): string {
    const key = `orders.status.${status}`;
    const label = this.translate.t(key);
    return label === key ? status : label;
  }

  loadPage(page: number): void {
    this.orderService.load(page);
  }

  get totalPages(): number {
    return Math.ceil(this.orderService.total() / 10);
  }
}
