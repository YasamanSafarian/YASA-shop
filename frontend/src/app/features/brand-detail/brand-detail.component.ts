import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';
import { CatalogService } from '../../core/services/catalog.service';
import { TranslateService } from '../../core/services/translate.service';
import { BrandDetail, Product } from '../../core/models/catalog';
import {
  getErrorMessage,
  getErrorStatus,
} from '../../shared/utils/errors';

@Component({
  selector: 'app-brand-detail',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, UiButtonComponent, UiStateComponent],
  templateUrl: './brand-detail.component.html',
  styleUrl: './brand-detail.component.scss',
})
export class BrandDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  readonly translate = inject(TranslateService);

  readonly brand = signal<BrandDetail | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal<string | null>(null);

  readonly products = computed<Product[]>(() => this.brand()?.products ?? []);

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

  private load(slug: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.catalog.getBrandBySlug(slug).subscribe({
      next: (brand) => {
        this.brand.set(brand);
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
