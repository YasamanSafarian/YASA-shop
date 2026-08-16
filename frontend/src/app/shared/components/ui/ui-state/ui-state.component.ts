import { Component, input } from '@angular/core';

export type UiStateKind = 'loading' | 'empty' | 'error';

@Component({
  selector: 'app-ui-state',
  standalone: true,
  templateUrl: './ui-state.component.html',
  styleUrl: './ui-state.component.scss',
})
export class UiStateComponent {
  readonly state = input<UiStateKind>('loading');
  readonly message = input<string | null>(null);
}
