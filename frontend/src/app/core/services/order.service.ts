import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Order, PaginatedOrders } from '../models/order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  readonly orders = signal<Order[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(page = 1, limit = 10): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.api.get<PaginatedOrders>(`/orders?page=${page}&limit=${limit}`),
      );
      this.orders.set(res.data);
      this.total.set(res.meta.total);
      this.page.set(page);
    } catch (e: any) {
      this.orders.set([]);
      this.total.set(0);
      this.error.set(e?.error?.message || e?.message || 'Failed to load orders');
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string): Promise<Order> {
    return firstValueFrom(this.api.get<Order>(`/orders/${id}`));
  }

  async cancel(id: string): Promise<Order> {
    const order = await firstValueFrom(
      this.api.post<Order>(`/orders/${id}/cancel`, {}),
    );
    this.orders.update(list =>
      list.map(o => (o.id === id ? order : o)),
    );
    return order;
  }
}
