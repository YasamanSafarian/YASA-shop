import { Component, inject, signal } from '@angular/core';
import { BrandCardComponent } from '../../shared/components/brand-card/brand-card.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';
import { CatalogService } from '../../core/services/catalog.service';
import { TranslateService } from '../../core/services/translate.service';
import { Brand } from '../../core/models/catalog';
import { getErrorMessage } from '../../shared/utils/errors';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [BrandCardComponent, UiStateComponent],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.scss',
})
export class BrandsComponent {
  private readonly catalog = inject(CatalogService);
  readonly translate = inject(TranslateService);

  readonly brands = signal<Brand[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.catalog.listBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(getErrorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
