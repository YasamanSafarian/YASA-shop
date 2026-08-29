import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService, Brand, FragranceFamily, Note, ProductDetail, ProductVariant } from '../../core/services/admin.service';
import { TranslateService } from '../../core/services/translate.service';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { UiSelectComponent, UiSelectOption } from '../../shared/components/ui/ui-select/ui-select.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [FormsModule, RouterLink, UiButtonComponent, UiSelectComponent, UiStateComponent],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
})
export class AdminProductsComponent implements OnInit {
  readonly admin = inject(AdminService);
  readonly translate = inject(TranslateService);

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly search = signal('');
  readonly error = signal('');
  readonly expandedId = signal<string | null>(null);
  readonly expandedSlug = signal<string | null>(null);

  /* ── Variant modal ── */
  readonly showVariantForm = signal(false);
  readonly editingVariantId = signal<string | null>(null);
  readonly variantError = signal('');
  readonly variantProductId = signal<string | null>(null);

  /* ── Notes editing ── */
  readonly notesEditMode = signal(false);
  readonly notesSaving = signal(false);
  readonly notesError = signal('');
  readonly newNoteName = signal('');
  readonly newNoteType = signal<'top' | 'middle' | 'base'>('top');
  notesDraft = { topIds: [] as string[], middleIds: [] as string[], baseIds: [] as string[] };

  /* ── Fragrance family editing ── */
  readonly familiesEditMode = signal(false);
  readonly familiesSaving = signal(false);
  readonly familiesError = signal('');
  readonly newFamilyName = signal('');
  familiesDraft: string[] = [];

  /* ── Image upload ── */
  readonly uploadingImage = signal(false);
  readonly uploadingVariantId = signal<string | null>(null);

  form = {
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    brandId: '',
    concentration: '',
  };

  variantForm = {
    sku: '',
    format: 'original',
    volumeMl: 25,
    price: 0,
    compareAtPrice: 0,
    stockQuantity: 0,
    isDefault: false,
  };

  get categoryOptions(): UiSelectOption[] {
    return this.admin.categories().map(c => ({ value: c.id, label: c.name }));
  }

  readonly concentrationOptions: UiSelectOption[] = [
    { value: 'edc', label: 'EDC' },
    { value: 'edt', label: 'EDT' },
    { value: 'edp', label: 'EDP' },
    { value: 'parfum', label: 'Parfum' },
    { value: 'extrait', label: 'Extrait' },
  ];

  readonly formatOptions: UiSelectOption[] = [
    { value: 'original', label: 'Original' },
    { value: 'decant', label: 'Decant' },
    { value: 'sample', label: 'Sample' },
    { value: 'gift_set', label: 'Gift Set' },
  ];

  get brandOptions(): UiSelectOption[] {
    return this.admin.brands().map(b => ({ value: b.id, label: b.name }));
  }

  ngOnInit(): void {
    this.admin.loadProducts();
    this.admin.loadBrands();
    this.admin.loadNotes();
    this.admin.loadCategories();
    this.admin.loadFragranceFamilies();
  }

  onSearch(): void {
    this.admin.loadProducts(1, 20, this.search() || undefined);
  }

  /* ── Product form ── */
  toggleForm(): void {
    if (this.showForm()) {
      this.resetForm();
    } else {
      this.showForm.set(true);
      this.editingId.set(null);
    }
  }

  resetForm(): void {
    this.form = { name: '', slug: '', description: '', categoryId: '', brandId: '', concentration: '' };
    this.showForm.set(false);
    this.editingId.set(null);
    this.error.set('');
  }

  async startEdit(product: ProductDetail): Promise<void> {
    this.form = {
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      categoryId: product.categories[0]?.id || '',
      brandId: product.brand.id,
      concentration: product.concentration || '',
    };
    this.editingId.set(product.id);
    this.showForm.set(true);
    this.error.set('');
  }

  async saveProduct(): Promise<void> {
    if (!this.form.name || !this.form.brandId) {
      this.error.set(this.translate.t('adminProducts.errorRequired'));
      return;
    }

    const isNew = !this.editingId();
    this.error.set('');
    try {
      if (this.editingId()) {
        await this.admin.updateProduct(this.editingId()!, {
          name: this.form.name,
          slug: this.form.slug || undefined,
          description: this.form.description || undefined,
          brandId: this.form.brandId,
          concentration: this.form.concentration || undefined,
          categoryIds: this.form.categoryId ? [this.form.categoryId] : undefined,
        });
        this.resetForm();
        this.admin.loadProducts(this.admin.productsPage());
      } else {
        const newName = this.form.name;
        await this.admin.createProduct({
          name: newName,
          slug: this.form.slug || undefined,
          description: this.form.description || undefined,
          brandId: this.form.brandId,
          concentration: this.form.concentration || undefined,
          categoryIds: this.form.categoryId ? [this.form.categoryId] : undefined,
        });
        this.resetForm();
        await this.admin.loadProducts(1, 20);
        const created = this.admin.products().find(p => p.name === newName);
        if (created) {
          this.expandedId.set(created.id);
          this.expandedSlug.set(created.slug);
          await this.admin.loadNotes();
          await this.admin.loadProductDetail(created.slug);
          const pd = this.admin.productDetail();
          if (pd) this.openNotesEditor(pd);
        }
      }
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

  /* ── Expand / detail ── */
  async toggleExpand(product: any): Promise<void> {
    if (this.expandedId() === product.id) {
      this.expandedId.set(null);
      this.expandedSlug.set(null);
      this.admin.productDetail.set(null);
      return;
    }
    this.expandedId.set(product.id);
    this.expandedSlug.set(product.slug);
    await this.admin.loadProductDetail(product.slug);
  }

  /* ── Variant form ── */
  openAddVariant(productId: string): void {
    this.variantProductId.set(productId);
    this.editingVariantId.set(null);
    this.variantForm = { sku: '', format: 'original', volumeMl: 25, price: 0, compareAtPrice: 0, stockQuantity: 0, isDefault: false };
    this.variantError.set('');
    this.showVariantForm.set(true);
  }

  openEditVariant(variant: ProductVariant, productId: string): void {
    this.variantProductId.set(productId);
    this.editingVariantId.set(variant.id);
    this.variantForm = {
      sku: variant.sku,
      format: variant.format,
      volumeMl: variant.volumeMl,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice ?? 0,
      stockQuantity: variant.stockQuantity,
      isDefault: variant.isDefault,
    };
    this.variantError.set('');
    this.showVariantForm.set(true);
  }

  closeVariantForm(): void {
    this.showVariantForm.set(false);
    this.editingVariantId.set(null);
    this.variantProductId.set(null);
  }

  async saveVariant(): Promise<void> {
    if (!this.variantForm.sku) {
      this.variantError.set(this.translate.t('adminProducts.variantErrorSku'));
      return;
    }

    this.variantError.set('');
    try {
      if (this.editingVariantId()) {
        await this.admin.updateVariant(this.editingVariantId()!, {
          sku: this.variantForm.sku,
          format: this.variantForm.format,
          volumeMl: this.variantForm.volumeMl,
          price: this.variantForm.price,
          compareAtPrice: this.variantForm.compareAtPrice || null,
          stockQuantity: this.variantForm.stockQuantity,
          isDefault: this.variantForm.isDefault,
        });
      } else {
        await this.admin.addVariant(this.variantProductId()!, {
          sku: this.variantForm.sku,
          format: this.variantForm.format,
          volumeMl: this.variantForm.volumeMl,
          price: this.variantForm.price,
          compareAtPrice: this.variantForm.compareAtPrice || null,
          stockQuantity: this.variantForm.stockQuantity,
          isDefault: this.variantForm.isDefault,
        });
      }
      this.closeVariantForm();
      if (this.expandedSlug()) {
        await this.admin.loadProductDetail(this.expandedSlug()!);
      }
      this.admin.loadProducts(this.admin.productsPage());
    } catch (e: any) {
      this.variantError.set(e?.error?.message || this.translate.t('adminProducts.errorCreate'));
    }
  }

  async updateStockQuick(variant: ProductVariant, delta: number): Promise<void> {
    const newQty = Math.max(0, variant.stockQuantity + delta);
    await this.admin.updateStock(variant.id, newQty);
    if (this.expandedSlug()) {
      await this.admin.loadProductDetail(this.expandedSlug()!);
    }
  }

  async deleteVariant(variant: ProductVariant): Promise<void> {
    if (!confirm(this.translate.t('adminProducts.confirmDeleteVariant'))) return;
    await this.admin.deleteVariant(variant.id);
    if (this.expandedSlug()) {
      await this.admin.loadProductDetail(this.expandedSlug()!);
    }
    this.admin.loadProducts(this.admin.productsPage());
  }

  totalStock(variants: ProductVariant[]): number {
    return variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  }

  categoryNames(categories: { name: string }[]): string {
    return categories.map(c => c.name).join(', ');
  }

  isSoldOut(variants: ProductVariant[]): boolean {
    return variants.length > 0 && variants.every(v => v.stockQuantity === 0);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-US');
  }

  getPrimaryImage(variant: ProductVariant): string {
    const primary = variant.images.find(i => i.isPrimary);
    return primary?.imageUrl || variant.images[0]?.imageUrl || '';
  }

  loadPage(page: number): void {
    this.admin.loadProducts(page, 20, this.search() || undefined);
  }

  get totalPages(): number {
    return Math.ceil(this.admin.productsTotal() / 20);
  }

  /* ── Notes editing ── */
  openNotesEditor(pd: ProductDetail): void {
    this.admin.loadNotes();
    this.notesDraft = {
      topIds: pd.notes.top.map(name => this.admin.allNotes().find(n => n.name === name)?.id).filter(Boolean) as string[],
      middleIds: pd.notes.middle.map(name => this.admin.allNotes().find(n => n.name === name)?.id).filter(Boolean) as string[],
      baseIds: pd.notes.base.map(name => this.admin.allNotes().find(n => n.name === name)?.id).filter(Boolean) as string[],
    };
    this.newNoteName.set('');
    this.notesError.set('');
    this.notesEditMode.set(true);
  }

  cancelNotesEdit(): void {
    this.notesEditMode.set(false);
    this.notesError.set('');
    this.newNoteName.set('');
  }

  toggleNote(type: 'topIds' | 'middleIds' | 'baseIds', noteId: string): void {
    const arr = this.notesDraft[type];
    const idx = arr.indexOf(noteId);
    if (idx === -1) {
      arr.push(noteId);
    } else {
      arr.splice(idx, 1);
    }
  }

  isNoteSelected(type: 'topIds' | 'middleIds' | 'baseIds', noteId: string): boolean {
    return this.notesDraft[type].includes(noteId);
  }

  setNewNoteType(type: 'top' | 'middle' | 'base'): void {
    this.newNoteType.set(type);
  }

  async addNewNote(): Promise<void> {
    const name = this.newNoteName().trim();
    if (!name) return;
    try {
      const note = await this.admin.createNote(name);
      const typeKey = `${this.newNoteType()}Ids` as 'topIds' | 'middleIds' | 'baseIds';
      this.notesDraft[typeKey].push(note.id);
      this.newNoteName.set('');
    } catch (e: any) {
      this.notesError.set(e?.error?.message || 'Failed to create note');
    }
  }

  async saveNotes(productId: string): Promise<void> {
    this.notesSaving.set(true);
    this.notesError.set('');
    try {
      await this.admin.updateProductNotes(productId, this.notesDraft.topIds, this.notesDraft.middleIds, this.notesDraft.baseIds);
      this.notesEditMode.set(false);
      if (this.expandedSlug()) {
        await this.admin.loadProductDetail(this.expandedSlug()!);
      }
    } catch (e: any) {
      this.notesError.set(e?.error?.message || 'Failed to update notes');
    } finally {
      this.notesSaving.set(false);
    }
  }

  /* ── Fragrance family editing ── */
  openFamiliesEditor(pd: ProductDetail): void {
    this.admin.loadFragranceFamilies();
    this.familiesDraft = pd.fragranceFamilies.map(f => f.id);
    this.newFamilyName.set('');
    this.familiesError.set('');
    this.familiesEditMode.set(true);
  }

  cancelFamiliesEdit(): void {
    this.familiesEditMode.set(false);
    this.familiesError.set('');
    this.newFamilyName.set('');
  }

  toggleFamily(familyId: string): void {
    const idx = this.familiesDraft.indexOf(familyId);
    if (idx === -1) {
      this.familiesDraft.push(familyId);
    } else {
      this.familiesDraft.splice(idx, 1);
    }
  }

  isFamilySelected(familyId: string): boolean {
    return this.familiesDraft.includes(familyId);
  }

  async addNewFamily(): Promise<void> {
    const name = this.newFamilyName().trim();
    if (!name) return;
    try {
      const family = await this.admin.createFragranceFamily(name);
      this.familiesDraft.push(family.id);
      this.newFamilyName.set('');
    } catch (e: any) {
      this.familiesError.set(e?.error?.message || 'Failed to create fragrance family');
    }
  }

  async saveFamilies(productId: string): Promise<void> {
    this.familiesSaving.set(true);
    this.familiesError.set('');
    try {
      await this.admin.updateProductFamilies(productId, this.familiesDraft);
      this.familiesEditMode.set(false);
      if (this.expandedSlug()) {
        await this.admin.loadProductDetail(this.expandedSlug()!);
      }
    } catch (e: any) {
      this.familiesError.set(e?.error?.message || 'Failed to update fragrance families');
    } finally {
      this.familiesSaving.set(false);
    }
  }

  /* ── Image upload ── */
  onImageSelected(event: Event, variantId: string): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return Promise.resolve();
    this.uploadingVariantId.set(variantId);
    this.uploadingImage.set(true);
    return this.admin.uploadImage(variantId, file).then(async () => {
      if (this.expandedSlug()) {
        await this.admin.loadProductDetail(this.expandedSlug()!);
      }
    }).finally(() => {
      this.uploadingImage.set(false);
      this.uploadingVariantId.set(null);
      input.value = '';
    });
  }

  async deleteImage(imageId: string): Promise<void> {
    await this.admin.deleteImage(imageId);
    if (this.expandedSlug()) {
      await this.admin.loadProductDetail(this.expandedSlug()!);
    }
  }

  async setPrimaryImage(imageId: string): Promise<void> {
    await this.admin.updateImage(imageId, { isPrimary: true });
    if (this.expandedSlug()) {
      await this.admin.loadProductDetail(this.expandedSlug()!);
    }
  }
}
