import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Order, PaginatedOrders } from '../models/order';

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  brand: { id: string; name: string };
  gender: string | null;
  productType: string;
  concentration: string | null;
  categories: { id: string; name: string; slug: string }[];
  isActive: boolean;
  variantCount: number;
  createdAt: string;
}

export interface AdminProductList {
  data: AdminProduct[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Note {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface FragranceFamily {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string | null;
  format: string;
  volumeMl: number;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  weight: number | null;
  isDefault: boolean;
  isActive: boolean;
  images: { id: string; imageUrl: string; isPrimary: boolean; altText: string | null }[];
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productType: string;
  gender: string | null;
  concentration: string | null;
  releaseYear: number | null;
  seasons: string[];
  occasions: string[];
  brand: { id: string; name: string };
  categories: { id: string; name: string }[];
  variants: ProductVariant[];
  notes: { top: string[]; middle: string[]; base: string[] };
  fragranceFamilies: { id: string; name: string }[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductPayload {
  brandId: string;
  name: string;
  slug?: string;
  description?: string;
  productType?: string;
  gender?: string;
  concentration?: string;
  releaseYear?: number;
  seasons?: string[];
  occasions?: string[];
  isActive?: boolean;
  variants?: {
    sku: string;
    format: string;
    volumeMl: number;
    price: number;
    stockQuantity?: number;
    isDefault?: boolean;
  }[];
  categoryIds?: string[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  /* ── Orders ── */
  readonly orders = signal<Order[]>([]);
  readonly ordersTotal = signal(0);
  readonly ordersPage = signal(1);
  readonly ordersLoading = signal(false);

  /* ── Products ── */
  readonly products = signal<AdminProduct[]>([]);
  readonly productsTotal = signal(0);
  readonly productsPage = signal(1);
  readonly productsLoading = signal(false);

  /* ── Product detail ── */
  readonly productDetail = signal<ProductDetail | null>(null);
  readonly productDetailLoading = signal(false);

  /* ── Notes (shared) ── */
  readonly allNotes = signal<Note[]>([]);
  readonly notesLoading = signal(false);

  /* ── Fragrance families (shared) ── */
  readonly allFamilies = signal<FragranceFamily[]>([]);

  /* ── Categories (shared) ── */
  readonly categories = signal<Category[]>([]);

  /* ── Brands (shared) ── */
  readonly brands = signal<Brand[]>([]);

  /* ── Orders ── */
  async loadOrders(page = 1, limit = 20, status?: string): Promise<void> {
    this.ordersLoading.set(true);
    try {
      let url = `/admin/orders?page=${page}&limit=${limit}`;
      if (status) url += `&orderStatus=${status}`;
      const res = await firstValueFrom(this.api.get<PaginatedOrders>(url));
      this.orders.set(res.data);
      this.ordersTotal.set(res.meta.total);
      this.ordersPage.set(page);
    } finally {
      this.ordersLoading.set(false);
    }
  }

  async updateOrderStatus(
    id: string,
    statuses: { orderStatus?: string; paymentStatus?: string; shipmentStatus?: string },
  ): Promise<Order> {
    const order = await firstValueFrom(
      this.api.patch<Order>(`/admin/orders/${id}/status`, statuses),
    );
    this.orders.update(list => list.map(o => (o.id === id ? order : o)));
    return order;
  }

  /* ── Products ── */
  async loadProducts(page = 1, limit = 20, search?: string): Promise<void> {
    this.productsLoading.set(true);
    try {
      let url = `/admin/products?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await firstValueFrom(this.api.get<AdminProductList>(url));
      this.products.set(res.data);
      this.productsTotal.set(res.meta.total);
      this.productsPage.set(page);
    } finally {
      this.productsLoading.set(false);
    }
  }

  async loadProductDetail(slug: string): Promise<void> {
    this.productDetailLoading.set(true);
    try {
      const res = await firstValueFrom(this.api.get<ProductDetail>(`/products/${slug}`));
      this.productDetail.set(res);
    } finally {
      this.productDetailLoading.set(false);
    }
  }

  async updateProduct(id: string, dto: Partial<CreateProductPayload>): Promise<void> {
    await firstValueFrom(this.api.patch(`/admin/products/${id}`, dto));
  }

  async createProduct(dto: CreateProductPayload): Promise<void> {
    await firstValueFrom(this.api.post('/admin/products', dto));
  }

  async deleteProduct(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(`/admin/products/${id}`));
    this.products.update(list => list.filter(p => p.id !== id));
    this.productsTotal.update(t => t - 1);
  }

  /* ── Variants ── */
  async addVariant(productId: string, dto: {
    sku: string;
    format: string;
    volumeMl: number;
    price: number;
    compareAtPrice?: number | null;
    stockQuantity?: number;
    isDefault?: boolean;
  }): Promise<void> {
    await firstValueFrom(this.api.post(`/admin/products/${productId}/variants`, dto));
  }

  async updateVariant(variantId: string, dto: Partial<{
    sku: string;
    format: string;
    volumeMl: number;
    price: number;
    compareAtPrice?: number | null;
    stockQuantity: number;
    isDefault: boolean;
    isActive: boolean;
  }>): Promise<void> {
    await firstValueFrom(this.api.patch(`/admin/products/variants/${variantId}`, dto));
  }

  async updateStock(variantId: string, stockQuantity: number): Promise<void> {
    await firstValueFrom(this.api.patch(`/admin/products/variants/${variantId}/stock`, { stockQuantity }));
  }

  async deleteVariant(variantId: string): Promise<void> {
    await firstValueFrom(this.api.delete(`/admin/products/variants/${variantId}`));
  }

  /* ── Brands ── */
  async loadBrands(): Promise<void> {
    if (this.brands().length) return;
    const res = await firstValueFrom(this.api.get<Brand[] | { data: Brand[] }>('/brands'));
    const list = Array.isArray(res) ? res : res.data;
    this.brands.set(list);
  }

  /* ── Categories ── */
  async loadCategories(): Promise<void> {
    if (this.categories().length) return;
    const res = await firstValueFrom(this.api.get<Category[]>('/categories'));
    this.categories.set(res);
  }

  /* ── Notes ── */
  async loadNotes(): Promise<void> {
    if (this.allNotes().length) return;
    this.notesLoading.set(true);
    try {
      const res = await firstValueFrom(this.api.get<Note[]>('/admin/notes'));
      this.allNotes.set(res);
    } finally {
      this.notesLoading.set(false);
    }
  }

  async createNote(name: string, slug?: string): Promise<Note> {
    const note = await firstValueFrom(
      this.api.post<Note>('/admin/notes', { name, slug }),
    );
    this.allNotes.update(list => [...list, note]);
    return note;
  }

  async loadFragranceFamilies(): Promise<void> {
    if (this.allFamilies().length) return;
    const res = await firstValueFrom(
      this.api.get<FragranceFamily[]>('/fragrance-families'),
    );
    this.allFamilies.set(res);
  }

  async createFragranceFamily(name: string, slug?: string): Promise<FragranceFamily> {
    const family = await firstValueFrom(
      this.api.post<FragranceFamily>('/admin/fragrance-families', { name, slug }),
    );
    this.allFamilies.update(list => [...list, family]);
    return family;
  }

  async updateProductNotes(productId: string, topNoteIds: string[], middleNoteIds: string[], baseNoteIds: string[]): Promise<void> {
    await firstValueFrom(this.api.patch(`/admin/products/${productId}/notes`, { topNoteIds, middleNoteIds, baseNoteIds }));
  }

  async updateProductFamilies(productId: string, fragranceFamilyIds: string[]): Promise<void> {
    await firstValueFrom(this.api.patch(`/admin/products/${productId}/fragrance-families`, { fragranceFamilyIds }));
  }

  /* ── Images ── */
  async uploadImage(variantId: string, file: File): Promise<any> {
    return firstValueFrom(this.api.upload(`/admin/products/variants/${variantId}/images`, file));
  }

  async updateImage(imageId: string, dto: { isPrimary?: boolean; altText?: string }): Promise<void> {
    await firstValueFrom(this.api.patch(`/admin/products/images/${imageId}`, dto));
  }

  async deleteImage(imageId: string): Promise<void> {
    await firstValueFrom(this.api.delete(`/admin/products/images/${imageId}`));
  }
}
