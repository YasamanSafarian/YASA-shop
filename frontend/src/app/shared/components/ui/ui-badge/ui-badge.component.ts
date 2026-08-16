import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-badge',
  standalone: true,
  templateUrl: './ui-badge.component.html',
  styleUrl: './ui-badge.component.scss',
})
export class UiBadgeComponent {
  readonly label = input('');
}
