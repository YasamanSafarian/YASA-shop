import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { UiInputComponent } from '../../shared/components/ui/ui-input/ui-input.component';
import {
  UiSelectComponent,
  UiSelectOption,
} from '../../shared/components/ui/ui-select/ui-select.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';
import { CatalogService } from '../../core/services/catalog.service';
import { TranslateService } from '../../core/services/translate.service';
import { getErrorMessage } from '../../shared/utils/errors';
import {
  Brand,
  CategoryNode,
  Product,
  ProductSort,
} from '../../core/models/catalog';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ProductCardComponent,
    UiButtonComponent,
    UiInputComponent,
    UiSelectComponent,
    UiStateComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly fb = inject(FormBuilder);
  readonly translate = inject(TranslateService);

  readonly products = signal<Product[]>([]);
  readonly brands = signal<Brand[]>([]);
  readonly categories = signal<CategoryNode[]>([]);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly filterForm = this.fb.group({
    search: [''],
    brand: [''],
    category: [''],
    gender: [''],
    sort: ['newest' as ProductSort],
  });

  readonly brandOptions = computed<UiSelectOption[]>(() =>
    this.brands().map((brand) => ({ value: brand.slug, label: brand.name })),
  );

  readonly categoryOptions = computed<UiSelectOption[]>(() =>
    this.categories().map((category) => ({
      value: category.slug,
      label: category.name,
    })),
  );

  readonly genderOptions = computed<UiSelectOption[]>(() => [
    { value: 'male', label: this.translate.t('products.genderMale') },
    { value: 'female', label: this.translate.t('products.genderFemale') },
    { value: 'unisex', label: this.translate.t('products.genderUnisex') },
  ]);

  readonly sortOptions = computed<UiSelectOption[]>(() => [
    { value: 'newest', label: this.translate.t('products.sortNewest') },
    { value: 'price_asc', label: this.translate.t('products.sortPriceAsc') },
    { value: 'price_desc', label: this.translate.t('products.sortPriceDesc') },
    { value: 'name_asc', label: this.translate.t('products.sortNameAsc') },
    { value: 'name_desc', label: this.translate.t('products.sortNameDesc') },
  ]);

  readonly filterCount = computed(
    () =>
      (this.filterForm.value.search ? 1 : 0) +
      (this.filterForm.value.brand ? 1 : 0) +
      (this.filterForm.value.category ? 1 : 0) +
      (this.filterForm.value.gender ? 1 : 0),
  );

  constructor() {
    this.loadFilters();

    this.filterForm.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.page.set(1);
      this.loadProducts();
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    const form = this.filterForm.getRawValue();
    this.catalog
      .listProducts({
        page: this.page(),
        limit: PAGE_SIZE,
        search: form.search || undefined,
        brand: form.brand || undefined,
        category: form.category || undefined,
        gender:
          form.gender === 'male' ||
          form.gender === 'female' ||
          form.gender === 'unisex'
            ? form.gender
            : undefined,
        sort: form.sort || undefined,
      })
      .subscribe({
        next: (result) => {
          this.products.set(result.data);
          this.page.set(result.meta.page);
          this.totalPages.set(result.meta.totalPages);
          this.total.set(result.meta.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(getErrorMessage(err));
          this.loading.set(false);
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.page.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.filterForm.setValue({
      search: '',
      brand: '',
      category: '',
      gender: '',
      sort: 'newest',
    });
    this.page.set(1);
    this.loadProducts();
  }

  private loadFilters(): void {
    this.catalog.listBrands().subscribe({
      next: (brands) => this.brands.set(brands),
      error: () => this.brands.set([]),
    });
    this.catalog.getCategoryTree().subscribe({
      next: (tree) => this.categories.set(this.flattenCategories(tree)),
      error: () => this.categories.set([]),
    });
  }

  private flattenCategories(nodes: CategoryNode[]): CategoryNode[] {
    return nodes.flatMap((node) => [
      node,
      ...this.flattenCategories(node.children),
    ]);
  }
}
