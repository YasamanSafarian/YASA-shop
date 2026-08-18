import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '../../core/services/translate.service';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, UiButtonComponent],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss',
})
export class OrderConfirmationComponent implements OnInit {
  private readonly router = inject(Router);
  readonly translate = inject(TranslateService);

  readonly cartNumber = signal('');
  readonly name = signal('');

  ngOnInit(): void {
    const state = history.state as {
      cartNumber?: string;
      name?: string;
    };
    if (state.cartNumber) {
      this.cartNumber.set(state.cartNumber);
      this.name.set(state.name ?? '');
    } else {
      this.router.navigate(['/']);
    }
  }
}
