import { Component, inject, signal } from '@angular/core';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';
import { CatalogService } from '../../core/services/catalog.service';
import { TranslateService } from '../../core/services/translate.service';
import { CategoryNode } from '../../core/models/catalog';
import { getErrorMessage } from '../../shared/utils/errors';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CategoryCardComponent, UiStateComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  private readonly catalog = inject(CatalogService);
  readonly translate = inject(TranslateService);

  readonly categories = signal<CategoryNode[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.catalog.getCategoryTree().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(getErrorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
