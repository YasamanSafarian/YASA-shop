import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { TranslateService } from '../../core/services/translate.service';
import { AlertService } from '../../core/services/alert.service';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';
import { CartItem } from '../../core/models/cart';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, UiButtonComponent, UiStateComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly translate = inject(TranslateService);
  private readonly alert = inject(AlertService);

  readonly loading = signal(true);
  readonly updatingId = signal<string | null>(null);
  readonly ordering = signal(false);

  get cart() {
    return this.cartService.cart();
  }

  readonly shippingCost = computed(() => {
    const count = this.cart?.totals.itemCount ?? 0;
    if (count <= 2) return 120;
    if (count <= 4) return 140;
    return 160;
  });

  readonly grandTotal = computed(() => {
    const sub = this.cart?.totals.subtotal ?? 0;
    return sub + this.shippingCost();
  });

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.cartService.load().finally(() => this.loading.set(false));
    } else {
      this.loading.set(false);
    }
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-US');
  }

  async updateQuantity(item: CartItem, delta: number): Promise<void> {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      return this.removeItem(item);
    }
    this.updatingId.set(item.id);
    try {
      await this.cartService.updateItem(item.id, newQty);
    } catch {
      // handled by interceptor
    } finally {
      this.updatingId.set(null);
    }
  }

  async removeItem(item: CartItem): Promise<void> {
    this.updatingId.set(item.id);
    try {
      await this.cartService.removeItem(item.id);
      this.alert.success(this.translate.t('cart.removedSuccess'));
    } catch {
      // handled by interceptor
    } finally {
      this.updatingId.set(null);
    }
  }

  async clearCart(): Promise<void> {
    await this.cartService.clear();
  }

  async checkout(): Promise<void> {
    this.ordering.set(true);
    try {
      const order = await firstValueFrom(
        this.api.post<any>('/orders', { note: '' }),
      );
      const user = this.auth.user();
      const name = user
        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.phone
        : '';
      this.router.navigate(['/order-confirmation'], {
        state: {
          cartNumber: order.orderNumber,
          name,
        },
      });
      this.alert.success(this.translate.t('orders.createdSuccess'));
    } catch (e: any) {
      this.alert.error(e?.error?.message || this.translate.t('orders.createFailed'));
    } finally {
      this.ordering.set(false);
    }
  }
}
