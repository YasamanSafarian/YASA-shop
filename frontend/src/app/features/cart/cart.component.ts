import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslateService } from '../../core/services/translate.service';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';
import { CartItem } from '../../core/models/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, UiButtonComponent, UiStateComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  readonly auth = inject(AuthService);
  readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly updatingId = signal<string | null>(null);

  get cart() {
    return this.cartService.cart();
  }

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
    } catch {
      // handled by interceptor
    } finally {
      this.updatingId.set(null);
    }
  }

  async clearCart(): Promise<void> {
    await this.cartService.clear();
  }
}
