import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Cart, CartItem, GuestCartSnapshot } from '../models/cart';
import { shippingFeeForItemCount } from '../utils/shipping';

const GUEST_CART_KEY = 'yasa.guest_cart';

interface GuestCartLine {
  variantId: string;
  quantity: number;
  snapshot: GuestCartSnapshot;
}

interface GuestCartStorage {
  items: GuestCartLine[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly cartSignal = signal<Cart | null>(null);
  readonly cart = this.cartSignal.asReadonly();

  readonly itemCount = signal(0);

  /** Load the appropriate cart for the current auth state. */
  async load(): Promise<void> {
    if (this.auth.isAuthenticated()) {
      await this.loadServerCart();
      return;
    }
    this.applyGuestCart(this.readGuest());
  }

  /**
   * After login/register: push guest lines to the server cart, then load.
   * Guest storage is cleared only after a successful merge attempt.
   */
  async syncAfterLogin(): Promise<void> {
    const guest = this.readGuest();
    if (guest.items.length > 0) {
      for (const line of guest.items) {
        try {
          await firstValueFrom(
            this.api.post('/cart/items', {
              variantId: line.variantId,
              quantity: line.quantity,
            }),
          );
        } catch {
          // Skip lines that fail (e.g. out of stock); remaining lines still merge.
        }
      }
      this.writeGuest({ items: [] });
    }
    await this.loadServerCart();
  }

  /** After logout: drop server cart from UI and restore any (empty) guest cart. */
  onLogout(): void {
    this.applyGuestCart(this.readGuest());
  }

  async addItem(
    variantId: string,
    quantity = 1,
    snapshot?: GuestCartSnapshot,
  ): Promise<void> {
    if (this.auth.isAuthenticated()) {
      await firstValueFrom(
        this.api.post('/cart/items', { variantId, quantity }),
      );
      await this.loadServerCart();
      return;
    }

    if (!snapshot) {
      throw new Error('guest cart requires a product snapshot');
    }

    const guest = this.readGuest();
    const existing = guest.items.find((item) => item.variantId === variantId);
    const nextQty = (existing?.quantity ?? 0) + quantity;

    if (nextQty > snapshot.stockQuantity) {
      const err = new Error(
        `insufficient stock: only ${snapshot.stockQuantity} available`,
      ) as Error & { status: number; message: string };
      err.status = 400;
      err.message = err.message;
      throw err;
    }

    if (existing) {
      existing.quantity = nextQty;
      existing.snapshot = { ...snapshot, stockQuantity: snapshot.stockQuantity };
    } else {
      guest.items.push({ variantId, quantity, snapshot });
    }

    this.writeGuest(guest);
    this.applyGuestCart(guest);
  }

  async updateItem(itemId: string, quantity: number): Promise<void> {
    if (this.auth.isAuthenticated()) {
      await firstValueFrom(
        this.api.patch(`/cart/items/${itemId}`, { quantity }),
      );
      await this.loadServerCart();
      return;
    }

    const variantId = this.guestVariantId(itemId);
    if (!variantId) {
      return;
    }

    const guest = this.readGuest();
    const line = guest.items.find((item) => item.variantId === variantId);
    if (!line) {
      return;
    }

    if (quantity > line.snapshot.stockQuantity) {
      const err = new Error(
        `insufficient stock: only ${line.snapshot.stockQuantity} available`,
      ) as Error & { status: number; message: string };
      err.status = 400;
      throw err;
    }

    line.quantity = quantity;
    this.writeGuest(guest);
    this.applyGuestCart(guest);
  }

  async removeItem(itemId: string): Promise<void> {
    if (this.auth.isAuthenticated()) {
      await firstValueFrom(this.api.delete(`/cart/items/${itemId}`));
      await this.loadServerCart();
      return;
    }

    const variantId = this.guestVariantId(itemId);
    if (!variantId) {
      return;
    }

    const guest = this.readGuest();
    guest.items = guest.items.filter((item) => item.variantId !== variantId);
    this.writeGuest(guest);
    this.applyGuestCart(guest);
  }

  async clear(): Promise<void> {
    if (this.auth.isAuthenticated()) {
      await firstValueFrom(this.api.delete('/cart'));
      await this.loadServerCart();
      return;
    }

    this.writeGuest({ items: [] });
    this.applyGuestCart({ items: [] });
  }

  private async loadServerCart(): Promise<void> {
    try {
      const cart = await firstValueFrom(this.api.get<Cart>('/cart'));
      this.cartSignal.set(cart);
      this.itemCount.set(cart.totals.itemCount);
    } catch {
      this.cartSignal.set(null);
      this.itemCount.set(0);
    }
  }

  private applyGuestCart(guest: GuestCartStorage): void {
    const now = new Date().toISOString();
    const items: CartItem[] = guest.items.map((line) => {
      const price = line.snapshot.price;
      return {
        id: `guest:${line.variantId}`,
        quantity: line.quantity,
        lineTotal: price * line.quantity,
        variant: {
          id: line.variantId,
          sku: line.snapshot.sku,
          format: line.snapshot.format,
          volumeMl: line.snapshot.volumeMl,
          price,
          compareAtPrice: line.snapshot.compareAtPrice,
          stockQuantity: line.snapshot.stockQuantity,
          weight: line.snapshot.weight,
          imageUrl: line.snapshot.imageUrl,
          product: line.snapshot.product,
        },
      };
    });

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingFee = shippingFeeForItemCount(itemCount);

    const cart: Cart = {
      id: 'guest',
      items,
      totals: {
        distinctItems: items.length,
        itemCount,
        subtotal,
        shippingFee,
        grandTotal: subtotal + shippingFee,
      },
      createdAt: now,
      updatedAt: now,
    };

    this.cartSignal.set(cart);
    this.itemCount.set(itemCount);
  }

  private readGuest(): GuestCartStorage {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (!raw) {
        return { items: [] };
      }
      const parsed = JSON.parse(raw) as GuestCartStorage;
      if (!parsed || !Array.isArray(parsed.items)) {
        return { items: [] };
      }
      return {
        items: parsed.items.filter(
          (item) =>
            item &&
            typeof item.variantId === 'string' &&
            typeof item.quantity === 'number' &&
            item.quantity > 0 &&
            item.snapshot,
        ),
      };
    } catch {
      return { items: [] };
    }
  }

  private writeGuest(guest: GuestCartStorage): void {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guest));
  }

  private guestVariantId(itemId: string): string | null {
    return itemId.startsWith('guest:') ? itemId.slice('guest:'.length) : null;
  }
}
