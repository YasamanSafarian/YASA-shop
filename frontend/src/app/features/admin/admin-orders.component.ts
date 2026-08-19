import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { TranslateService } from '../../core/services/translate.service';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';
import { UiStepperComponent, StepperStep } from '../../shared/components/ui/ui-stepper/ui-stepper.component';
import { Order } from '../../core/models/order';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [RouterLink, UiButtonComponent, UiStateComponent, UiStepperComponent],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
})
export class AdminOrdersComponent implements OnInit {
  readonly adminService = inject(AdminService);
  readonly translate = inject(TranslateService);

  readonly expandedId = signal<string | null>(null);
  readonly processingId = signal<string | null>(null);
  readonly filterStatus = signal<string>('');

  readonly statuses = [
    { value: '', labelKey: 'admin.allOrders' },
    { value: 'pending', labelKey: 'orders.status.pending' },
    { value: 'paid', labelKey: 'orders.status.paid' },
    { value: 'packing', labelKey: 'orders.status.packing' },
    { value: 'shipped', labelKey: 'orders.status.shipped' },
    { value: 'delivered', labelKey: 'orders.status.delivered' },
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.adminService.load(1, 20, this.filterStatus() || undefined);
  }

  onFilterChange(status: string): void {
    this.filterStatus.set(status);
    this.loadOrders();
  }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-US');
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  statusLabel(status: string): string {
    const key = `orders.status.${status}`;
    const label = this.translate.t(key);
    return label === key ? status : label;
  }

  getSteps(): StepperStep[] {
    return [
      { label: this.translate.t('stepper.paid') },
      { label: this.translate.t('stepper.confirmed') },
      { label: this.translate.t('stepper.inProgress') },
      { label: this.translate.t('stepper.toPost') },
      { label: this.translate.t('stepper.delivered') },
    ];
  }

  getStepIndex(order: Order): number {
    const { payment, order: orderStatus, shipment } = order.statuses;
    if (orderStatus === 'cancelled' || orderStatus === 'returned') return -1;
    if (payment !== 'paid') return 0;
    if (orderStatus === 'paid') return 1;
    if (orderStatus === 'packing') return 2;
    if (shipment === 'sent' || orderStatus === 'shipped') return 3;
    if (orderStatus === 'delivered') return 4;
    return 0;
  }

  isCancelled(order: Order): boolean {
    return order.statuses.order === 'cancelled' || order.statuses.order === 'returned';
  }

  async confirmPayment(order: Order): Promise<void> {
    this.processingId.set(order.id);
    try {
      await this.adminService.updateStatus(order.id, { paymentStatus: 'paid', orderStatus: 'paid' });
    } catch {
      // handled by interceptor
    } finally {
      this.processingId.set(null);
    }
  }

  async confirmOrder(order: Order): Promise<void> {
    this.processingId.set(order.id);
    try {
      await this.adminService.updateStatus(order.id, { orderStatus: 'packing' });
    } catch {
      // handled by interceptor
    } finally {
      this.processingId.set(null);
    }
  }

  async shipOrder(order: Order): Promise<void> {
    this.processingId.set(order.id);
    try {
      await this.adminService.updateStatus(order.id, { orderStatus: 'shipped', shipmentStatus: 'sent' });
    } catch {
      // handled by interceptor
    } finally {
      this.processingId.set(null);
    }
  }

  async deliverOrder(order: Order): Promise<void> {
    this.processingId.set(order.id);
    try {
      await this.adminService.updateStatus(order.id, { orderStatus: 'delivered', shipmentStatus: 'delivered' });
    } catch {
      // handled by interceptor
    } finally {
      this.processingId.set(null);
    }
  }

  async cancelOrder(order: Order): Promise<void> {
    this.processingId.set(order.id);
    try {
      await this.adminService.updateStatus(order.id, { orderStatus: 'cancelled' });
    } catch {
      // handled by interceptor
    } finally {
      this.processingId.set(null);
    }
  }

  loadPage(page: number): void {
    this.adminService.load(page, 20, this.filterStatus() || undefined);
  }

  get totalPages(): number {
    return Math.ceil(this.adminService.total() / 20);
  }
}
