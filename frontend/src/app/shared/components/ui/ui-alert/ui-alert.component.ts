import { Component, input } from '@angular/core';

export type UiAlertType = 'error' | 'success';

@Component({
  selector: 'app-ui-alert',
  standalone: true,
  templateUrl: './ui-alert.component.html',
  styleUrl: './ui-alert.component.scss',
})
export class UiAlertComponent {
  readonly message = input<string | null>(null);
  readonly type = input<UiAlertType>('error');
}
