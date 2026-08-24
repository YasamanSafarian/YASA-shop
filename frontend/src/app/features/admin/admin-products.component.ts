import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, Brand } from '../../core/services/admin.service';
import { TranslateService } from '../../core/services/translate.service';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { UiSelectComponent, UiSelectOption } from '../../shared/components/ui/ui-select/ui-select.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [FormsModule, UiButtonComponent, UiSelectComponent, UiStateComponent],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
})
export class AdminProductsComponent implements OnInit {
  readonly admin = inject(AdminService);
  readonly translate = inject(TranslateService);

  readonly showForm = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly search = signal('');
  readonly error = signal('');

  form = {
    name: '',
    slug: '',
    description: '',
    gender: '',
    brandId: '',
    concentration: '',
  };

  readonly genderOptions: UiSelectOption[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'unisex', label: 'Unisex' },
  ];

  readonly concentrationOptions: UiSelectOption[] = [
    { value: 'edc', label: 'EDC' },
    { value: 'edt', label: 'EDT' },
    { value: 'edp', label: 'EDP' },
    { value: 'parfum', label: 'Parfum' },
    { value: 'extrait', label: 'Extrait' },
  ];

  get brandOptions(): UiSelectOption[] {
    return this.admin.brands().map(b => ({ value: b.id, label: b.name }));
  }

  ngOnInit(): void {
    this.admin.loadProducts();
    this.admin.loadBrands();
  }

  onSearch(): void {
    this.admin.loadProducts(1, 20, this.search() || undefined);
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    this.error.set('');
  }

  resetForm(): void {
    this.form = { name: '', slug: '', description: '', gender: '', brandId: '', concentration: '' };
    this.showForm.set(false);
    this.error.set('');
  }

  async createProduct(): Promise<void> {
    if (!this.form.name || !this.form.brandId) {
      this.error.set(this.translate.t('adminProducts.errorRequired'));
      return;
    }

    this.error.set('');
    try {
      await this.admin.createProduct({
        name: this.form.name,
        slug: this.form.slug || undefined,
        description: this.form.description || undefined,
        gender: this.form.gender || undefined,
        brandId: this.form.brandId,
        concentration: this.form.concentration || undefined,
      });
      this.resetForm();
      this.admin.loadProducts(this.admin.productsPage());
    } catch (e: any) {
      this.error.set(e?.error?.message || this.translate.t('adminProducts.errorCreate'));
    }
  }

  async deleteProduct(id: string): Promise<void> {
    if (!confirm(this.translate.t('adminProducts.confirmDelete'))) return;
    this.deletingId.set(id);
    try {
      await this.admin.deleteProduct(id);
    } catch {
      // handled by interceptor
    } finally {
      this.deletingId.set(null);
    }
  }

  loadPage(page: number): void {
    this.admin.loadProducts(page, 20, this.search() || undefined);
  }

  get totalPages(): number {
    return Math.ceil(this.admin.productsTotal() / 20);
  }
}
