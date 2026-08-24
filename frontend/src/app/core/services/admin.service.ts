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
  concentration: string | null;
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

export interface CreateProductPayload {
  brandId: string;
  name: string;
  slug?: string;
  description?: string;
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

  async createProduct(dto: CreateProductPayload): Promise<void> {
    await firstValueFrom(this.api.post('/admin/products', dto));
  }

  async deleteProduct(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(`/admin/products/${id}`));
    this.products.update(list => list.filter(p => p.id !== id));
    this.productsTotal.update(t => t - 1);
  }

  /* ── Brands ── */
  async loadBrands(): Promise<void> {
    if (this.brands().length) return;
    const res = await firstValueFrom(this.api.get<Brand[] | { data: Brand[] }>('/brands'));
    const list = Array.isArray(res) ? res : res.data;
    this.brands.set(list);
  }
}
