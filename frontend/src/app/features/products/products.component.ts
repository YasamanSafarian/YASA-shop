import {
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  FragranceFamily,
  Product,
  ProductSort,
  ProductType,
  isProductType,
} from '../../core/models/catalog';

const PAGE_SIZE = 12;

const PRODUCT_TYPE_LABEL_KEYS: Record<ProductType, string> = {
  perfume: 'products.typePerfume',
  body_spray: 'products.typeBodySpray',
  charm_bag: 'products.typeCharmBag',
  candle: 'products.typeCandle',
  cream_lotion: 'products.typeCreamLotion',
  gift_box: 'products.typeGiftBox',
};

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly translate = inject(TranslateService);

  readonly products = signal<Product[]>([]);
  readonly brands = signal<Brand[]>([]);
  readonly fragranceFamilies = signal<FragranceFamily[]>([]);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly filtersOpen = signal(false);

  readonly filterForm = this.fb.group({
    search: [''],
    type: [''],
    brand: [''],
    fragranceFamily: this.fb.control({ value: '', disabled: true }),
    gender: [''],
    availability: [''],
    sort: ['newest' as ProductSort],
  });

  readonly brandOptions = computed<UiSelectOption[]>(() =>
    this.brands().map((brand) => ({ value: brand.slug, label: brand.name })),
  );

  readonly fragranceFamilyOptions = computed<UiSelectOption[]>(() =>
    this.fragranceFamilies().map((ff) => ({
      value: ff.slug,
      label: ff.name,
    })),
  );

  readonly genderOptions = computed<UiSelectOption[]>(() => [
    { value: 'male', label: this.translate.t('products.genderMale') },
    { value: 'female', label: this.translate.t('products.genderFemale') },
    { value: 'unisex', label: this.translate.t('products.genderUnisex') },
  ]);

  readonly availabilityOptions = computed<UiSelectOption[]>(() => [
    {
      value: 'in_stock',
      label: this.translate.t('products.availabilityInStock'),
    },
  ]);

  readonly sortOptions = computed<UiSelectOption[]>(() => [
    { value: 'newest', label: this.translate.t('products.sortNewest') },
    { value: 'price_asc', label: this.translate.t('products.sortPriceAsc') },
    { value: 'price_desc', label: this.translate.t('products.sortPriceDesc') },
    { value: 'name_asc', label: this.translate.t('products.sortNameAsc') },
    { value: 'name_desc', label: this.translate.t('products.sortNameDesc') },
  ]);

  readonly typeOptions = computed<UiSelectOption[]>(() =>
    (Object.keys(PRODUCT_TYPE_LABEL_KEYS) as ProductType[]).map((type) => ({
      value: type,
      label: this.translate.t(PRODUCT_TYPE_LABEL_KEYS[type]),
    })),
  );

  readonly selectedType = computed<ProductType | null>(() => {
    const type = this.filterForm.value.type;
    return isProductType(type) ? type : null;
  });

  readonly showComingSoon = computed(
    () =>
      !this.loading() &&
      !this.error() &&
      this.products().length === 0 &&
      this.selectedType() !== null,
  );

  readonly comingSoonMessage = computed(() => {
    return this.translate.t('products.comingSoon');
  });

  readonly fragranceFamilyDisabled = computed(
    () => this.filterForm.value.type === 'perfume',
  );

  readonly filterCount = computed(
    () =>
      (this.filterForm.value.search ? 1 : 0) +
      (this.filterForm.value.type ? 1 : 0) +
      (this.filterForm.value.brand ? 1 : 0) +
      (this.filterForm.value.fragranceFamily ? 1 : 0) +
      (this.filterForm.value.gender ? 1 : 0) +
      (this.filterForm.value.availability ? 1 : 0),
  );

  constructor() {
    this.loadFilters();

    this.filterForm.controls.type.valueChanges.subscribe(() => {
      this.syncFragranceFamilyState();
    });

    this.syncFragranceFamilyState();

    this.filterForm.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.page.set(1);
      this.syncTypeQueryParam();
      this.loadProducts();
    });
  }

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type');
    if (isProductType(type)) {
      this.filterForm.patchValue({ type }, { emitEvent: false });
      this.syncFragranceFamilyState();
    }

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
        type: isProductType(form.type) ? form.type : undefined,
        brand: form.brand || undefined,
        fragranceFamily: form.fragranceFamily || undefined,
        gender:
          form.gender === 'male' ||
          form.gender === 'female' ||
          form.gender === 'unisex'
            ? form.gender
            : undefined,
        availability: form.availability === 'in_stock' ? 'in_stock' : undefined,
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
          // Empty / not-yet-migrated product types should show Coming soon, not a validation error.
          if (isProductType(form.type)) {
            this.products.set([]);
            this.page.set(1);
            this.totalPages.set(1);
            this.total.set(0);
            this.error.set(null);
            this.loading.set(false);
            return;
          }
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
      type: '',
      brand: '',
      fragranceFamily: '',
      gender: '',
      availability: '',
      sort: 'newest',
    });
    this.syncFragranceFamilyState();
    this.page.set(1);
    this.syncTypeQueryParam();
    this.loadProducts();
  }

  private syncTypeQueryParam(): void {
    const type = this.filterForm.value.type;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: isProductType(type) ? { type } : {},
      replaceUrl: true,
    });
  }

  private syncFragranceFamilyState(): void {
    const familyControl = this.filterForm.controls.fragranceFamily;
    const enableFamily = this.filterForm.value.type !== 'perfume';
    if (enableFamily) {
      familyControl.enable({ emitEvent: false });
    } else {
      familyControl.setValue('', { emitEvent: false });
      familyControl.disable({ emitEvent: false });
    }
  }

  @HostListener('window:keydown.escape')
  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  private loadFilters(): void {
    this.catalog.listBrands().subscribe({
      next: (brands) => this.brands.set(brands),
      error: () => this.brands.set([]),
    });
    this.catalog.listFragranceFamilies().subscribe({
      next: (families) => this.fragranceFamilies.set(families),
      error: () => this.fragranceFamilies.set([]),
    });
  }
}
