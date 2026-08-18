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
import { AlertService } from '../../../core/services/alert.service';
import { UiButtonComponent } from '../ui/ui-button/ui-button.component';

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
  private readonly alert = inject(AlertService);

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
    this.adding.set(true);
    try {
      await this.cart.addItem(this.variant().id);
      this.alert.success(this.translate.t('cart.addedSuccess'));
    } catch {
      this.alert.error(this.translate.t('cart.addedError'));
    } finally {
      this.adding.set(false);
    }
  }
}
