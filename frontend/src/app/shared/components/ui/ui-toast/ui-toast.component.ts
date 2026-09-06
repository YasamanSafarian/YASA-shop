import { Component, inject } from '@angular/core';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-ui-toast',
  standalone: true,
  templateUrl: './ui-toast.component.html',
  styleUrl: './ui-toast.component.scss',
})
export class UiToastComponent {
  readonly toastService = inject(ToastService);
}
