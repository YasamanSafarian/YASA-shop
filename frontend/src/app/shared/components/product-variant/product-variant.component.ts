import { Component, computed, inject, input } from '@angular/core';
import { ProductVariant } from '../../../core/models/catalog';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-product-variant',
  standalone: true,
  templateUrl: './product-variant.component.html',
  styleUrl: './product-variant.component.scss',
})
export class ProductVariantComponent {
  readonly variant = input.required<ProductVariant>();
  readonly translate = inject(TranslateService);

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
}
