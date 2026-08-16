import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { TranslateService } from '../../core/services/translate.service';
import { Product, ProductVariant } from '../../core/models/catalog';
import { UiBadgeComponent } from '../../shared/components/ui/ui-badge/ui-badge.component';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { UiChipComponent } from '../../shared/components/ui/ui-chip/ui-chip.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';
import { ProductVariantComponent } from '../../shared/components/product-variant/product-variant.component';
import {
  getErrorMessage,
  getErrorStatus,
} from '../../shared/utils/errors';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    UiBadgeComponent,
    UiButtonComponent,
    UiChipComponent,
    UiStateComponent,
    ProductVariantComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  readonly translate = inject(TranslateService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal<string | null>(null);

  readonly primaryImage = computed<string | null>(() => {
    const product = this.product();
    if (!product) {
      return null;
    }
    for (const variant of product.variants) {
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

  readonly variants = computed<ProductVariant[]>(
    () => this.product()?.variants ?? [],
  );

  readonly fragranceFamilies = computed(
    () => this.product()?.fragranceFamilies ?? [],
  );

  readonly seasons = computed<string[]>(() => this.product()?.seasons ?? []);

  readonly occasions = computed<string[]>(() => this.product()?.occasions ?? []);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.notFound.set(true);
        this.loading.set(false);
        return;
      }
      this.load(slug);
    });
  }

  genderKey(product: Product): string {
    if (
      product.gender === 'male' ||
      product.gender === 'female' ||
      product.gender === 'unisex'
    ) {
      return `products.gender${product.gender.charAt(0).toUpperCase()}${product.gender.slice(1)}`;
    }
    return product.gender ?? '';
  }

  private load(slug: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.catalog.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (getErrorStatus(err) === 404) {
          this.notFound.set(true);
        } else {
          this.error.set(getErrorMessage(err));
        }
      },
    });
  }
}
