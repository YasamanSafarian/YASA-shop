import {
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Product, ProductVariant } from '../../../core/models/catalog';
import { TranslateService } from '../../../core/services/translate.service';
import { CartService } from '../../../core/services/cart.service';
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
  readonly product = input.required<Product>();
  readonly productType = input<string>('perfume');
  readonly translate = inject(TranslateService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  readonly adding = signal(false);
  readonly quantity = signal(1);

  readonly isPerfume = computed(() => this.productType() === 'perfume');

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

  adjustQuantity(delta: number): void {
    this.quantity.update((current) =>
      Math.min(this.variant().stockQuantity, Math.max(1, current + delta)),
    );
  }

  async addToCart(): Promise<void> {
    if (!this.isAvailable()) {
      this.toast.error(this.translate.t('cart.addSoldOut'));
      return;
    }
    this.adding.set(true);
    try {
      const variant = this.variant();
      const product = this.product();
      const primary =
        variant.images.find((img) => img.isPrimary) ?? variant.images[0];

      await this.cart.addItem(variant.id, this.quantity(), {
        sku: variant.sku,
        format: variant.format,
        volumeMl: variant.volumeMl,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        stockQuantity: variant.stockQuantity,
        weight: variant.weight,
        imageUrl: primary?.imageUrl ?? null,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          gender: product.gender,
          concentration: product.concentration,
          brand: {
            id: product.brand.id,
            name: product.brand.name,
            slug: product.brand.slug,
          },
        },
      });
      this.toast.success(this.translate.t('cart.added'));
      this.quantity.set(1);
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
