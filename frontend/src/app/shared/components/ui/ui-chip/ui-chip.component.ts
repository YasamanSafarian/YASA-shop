import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-chip',
  standalone: true,
  templateUrl: './ui-chip.component.html',
  styleUrl: './ui-chip.component.scss',
})
export class UiChipComponent {
  readonly label = input('');
  readonly title = input<string | null>(null);
}
