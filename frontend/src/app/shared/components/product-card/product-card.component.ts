import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/catalog';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly translate = inject(TranslateService);

  readonly image = computed<string | null>(() => {
    for (const variant of this.product().variants) {
      const primary = variant.images.find((img) => img.isPrimary);
      if (primary) {
        return primary.imageUrl;
      }
      if (variant.images.length > 0) {
        return variant.images[0].imageUrl;
      }
    }
    return null;
  });

  readonly minPrice = computed<number | null>(() => {
    if (this.product().variants.length === 0) {
      return null;
    }
    return Math.min(...this.product().variants.map((v) => v.price));
  });

  formatPrice(price: number): string {
    return price.toLocaleString('en-US');
  }
}
