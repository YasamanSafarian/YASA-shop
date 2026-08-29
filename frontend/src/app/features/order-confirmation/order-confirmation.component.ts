import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';

const CARD_NUMBER = '6219-8619-3904-0365';
const CARD_HOLDER = 'یاسمن صفریان';
const TELEGRAM = '@the_yasa';
const SMS_NUMBER = '09212500868';
const DEADLINE_MS = 35 * 60 * 1000;

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, UiButtonComponent],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss',
})
export class OrderConfirmationComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  readonly translate = inject(TranslateService);

  readonly orderNumber = signal('');
  readonly subtotal = signal(0);
  readonly shippingFee = signal(0);
  readonly total = signal(0);
  readonly copied = signal(false);
  readonly remaining = signal(DEADLINE_MS);

  readonly cardNumber = CARD_NUMBER;
  readonly cardHolder = CARD_HOLDER;
  readonly telegram = TELEGRAM;
  readonly smsNumber = SMS_NUMBER;

  readonly timerText = computed(() => {
    const ms = this.remaining();
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  });

  readonly expired = computed(() => this.remaining() <= 0);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private orderCreatedAt = 0;

  ngOnInit(): void {
    const state = history.state as {
      orderNumber?: string;
      subtotal?: number;
      shippingFee?: number;
      total?: number;
      createdAt?: string;
    };

    if (state.orderNumber) {
      this.orderNumber.set(state.orderNumber);
      this.subtotal.set(state.subtotal ?? 0);
      this.shippingFee.set(state.shippingFee ?? 0);
      this.total.set(state.total ?? 0);
      this.orderCreatedAt = state.createdAt
        ? new Date(state.createdAt).getTime()
        : Date.now();
    } else {
      this.router.navigate(['/']);
      return;
    }

    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async copyCard(): Promise<void> {
    const raw = this.cardNumber.replace(/-/g, '');
    try {
      await navigator.clipboard.writeText(raw);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = raw;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-US');
  }

  private tick(): void {
    const elapsed = Date.now() - this.orderCreatedAt;
    this.remaining.set(Math.max(0, DEADLINE_MS - elapsed));
  }
}
