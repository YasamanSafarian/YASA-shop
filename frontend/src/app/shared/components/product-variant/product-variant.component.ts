import {
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ProductVariant } from '../../../core/models/catalog';
import { TranslateService } from '../../../core/services/translate.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UiButtonComponent } from '../ui/ui-button/ui-button.component';
import { ApiError } from '../../../core/interceptors/error.interceptor';

@Component({
  selector: 'app-product-variant',
  standalone: true,
  imports: [UiButtonComponent],
  templateUrl: './product-variant.component.html',
  styleUrl: './product-variant.component.scss',
})
export class ProductVariantComponent {
  readonly variant = input.required<ProductVariant>();
  readonly translate = inject(TranslateService);
  private readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly adding = signal(false);

  readonly hasComparePrice = computed(() => {
    const variant = this.variant();
    return variant.compareAtPrice != null && variant.compareAtPrice > variant.price;
  });

  isAvailable(): boolean {
    return this.variant().isActive && this.variant().stockQuantity > 0;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-US');
  }

  async addToCart(): Promise<void> {
    if (!this.isAvailable()) {
      this.toast.error(this.translate.t('cart.addSoldOut'));
      return;
    }
    this.adding.set(true);
    try {
      await this.cart.addItem(this.variant().id);
    } catch (err) {
      const status = (err as ApiError)?.status;
      const message = (err as ApiError)?.message ?? '';
      if (status === 400 && /insufficient stock/i.test(message)) {
        this.toast.error(this.translate.t('cart.addSoldOut'));
      } else {
        this.toast.error(this.translate.t('cart.addError'));
      }
    } finally {
      this.adding.set(false);
    }
  }
}
