import { Component, inject } from '@angular/core';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  readonly alertService = inject(AlertService);

  iconPath(type: string): string {
    switch (type) {
      case 'success':
        return 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3';
      case 'warning':
        return 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z';
      case 'error':
        return 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z';
      default:
        return '';
    }
  }
}
