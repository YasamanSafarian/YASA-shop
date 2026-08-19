import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Order, PaginatedOrders } from '../models/order';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  readonly orders = signal<Order[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loading = signal(false);

  async load(page = 1, limit = 20, status?: string): Promise<void> {
    this.loading.set(true);
    try {
      let url = `/admin/orders?page=${page}&limit=${limit}`;
      if (status) url += `&orderStatus=${status}`;
      const res = await firstValueFrom(
        this.api.get<PaginatedOrders>(url),
      );
      this.orders.set(res.data);
      this.total.set(res.meta.total);
      this.page.set(page);
    } finally {
      this.loading.set(false);
    }
  }

  async updateStatus(
    id: string,
    statuses: { orderStatus?: string; paymentStatus?: string; shipmentStatus?: string },
  ): Promise<Order> {
    const order = await firstValueFrom(
      this.api.patch<Order>(`/admin/orders/${id}/status`, statuses),
    );
    this.orders.update(list => list.map(o => (o.id === id ? order : o)));
    return order;
  }
}
