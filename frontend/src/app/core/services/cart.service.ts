import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { Cart } from '../models/cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);

  private readonly cartSignal = signal<Cart | null>(null);
  readonly cart = this.cartSignal.asReadonly();

  readonly itemCount = signal(0);

  async load(): Promise<void> {
    try {
      const cart = await firstValueFrom(this.api.get<Cart>('/cart'));
      this.cartSignal.set(cart);
      this.itemCount.set(cart.totals.itemCount);
    } catch {
      this.cartSignal.set(null);
      this.itemCount.set(0);
    }
  }

  async addItem(variantId: string, quantity = 1): Promise<void> {
    await firstValueFrom(
      this.api.post('/cart/items', { variantId, quantity }),
    );
    await this.load();
  }

  async updateItem(itemId: string, quantity: number): Promise<void> {
    await firstValueFrom(
      this.api.patch(`/cart/items/${itemId}`, { quantity }),
    );
    await this.load();
  }

  async removeItem(itemId: string): Promise<void> {
    await firstValueFrom(this.api.delete(`/cart/items/${itemId}`));
    await this.load();
  }

  async clear(): Promise<void> {
    await firstValueFrom(this.api.delete('/cart'));
    await this.load();
  }
}
