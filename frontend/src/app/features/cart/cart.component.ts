import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { TranslateService } from '../../core/services/translate.service';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { UiInputComponent } from '../../shared/components/ui/ui-input/ui-input.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';
import { CartItem } from '../../core/models/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, UiButtonComponent, UiInputComponent, UiStateComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly updatingId = signal<string | null>(null);
  readonly ordering = signal(false);
  readonly error = signal<string | null>(null);
  readonly step = signal<'review' | 'address'>('review');

  readonly addressForm: FormGroup = this.fb.group({
    receiverName: ['', [Validators.required, Validators.maxLength(150)]],
    receiverPhone: ['', [Validators.required, Validators.pattern(/^[0-9+\- ]{6,20}$/)]],
    province: ['', [Validators.required, Validators.maxLength(100)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    postalCode: ['', [Validators.required, Validators.pattern(/^[0-9a-zA-Z\- ]{3,20}$/)]],
    address: ['', Validators.required],
  });

  get cart() {
    return this.cartService.cart();
  }

  readonly shippingCost = computed(() => {
    const count = this.cart?.totals.itemCount ?? 0;
    if (count <= 2) return 120;
    if (count <= 4) return 140;
    return 160;
  });

  readonly grandTotal = computed(() => {
    const sub = this.cart?.totals.subtotal ?? 0;
    return sub + this.shippingCost();
  });

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.cartService.load().finally(() => this.loading.set(false));
    } else {
      this.loading.set(false);
    }
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-US');
  }

  async updateQuantity(item: CartItem, delta: number): Promise<void> {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      return this.removeItem(item);
    }
    this.updatingId.set(item.id);
    try {
      await this.cartService.updateItem(item.id, newQty);
    } catch {
      // handled by interceptor
    } finally {
      this.updatingId.set(null);
    }
  }

  async removeItem(item: CartItem): Promise<void> {
    this.updatingId.set(item.id);
    try {
      await this.cartService.removeItem(item.id);
    } catch {
      // handled by interceptor
    } finally {
      this.updatingId.set(null);
    }
  }

  async clearCart(): Promise<void> {
    await this.cartService.clear();
  }

  goToAddress(): void {
    this.error.set(null);
    this.step.set('address');
  }

  backToReview(): void {
    this.error.set(null);
    this.step.set('review');
  }

  async placeOrder(): Promise<void> {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.ordering.set(true);
    this.error.set(null);

    try {
      const user = this.auth.user();
      const name = user
        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.phone
        : '';

      const addr = await firstValueFrom(
        this.api.post<{ id: string }>(
          '/users/me/addresses',
          { ...this.addressForm.value, isDefault: true },
        ),
      );

      const order = await firstValueFrom(
        this.api.post<{ id: string; orderNumber: string }>(
          '/orders',
          { addressId: addr.id },
        ),
      );

      this.router.navigate(['/order-confirmation'], {
        state: {
          cartNumber: order.orderNumber,
          name,
        },
      });
    } catch (e: any) {
      const msg = e?.error?.message;
      this.error.set(msg || this.translate.t('cart.orderError'));
    } finally {
      this.ordering.set(false);
    }
  }

  fieldError(field: string): string | null {
    const ctrl = this.addressForm.get(field);
    if (!ctrl || !ctrl.touched || !ctrl.invalid) return null;
    if (ctrl.errors?.['required']) return this.translate.t('address.error.required');
    if (ctrl.errors?.['pattern']) return this.translate.t('address.error.pattern');
    if (ctrl.errors?.['maxlength']) return this.translate.t('address.error.maxLength');
    return null;
  }
}
