import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type UiButtonVariant =
  | 'primary'
  | 'navy'
  | 'outline'
  | 'ghost'
  | 'link';
export type UiButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ui-button.component.html',
  styleUrl: './ui-button.component.scss',
  host: { '[class.is-block]': 'block()' },
})
export class UiButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');
  readonly block = input(false);
  readonly disabled = input(false);
  readonly link = input<string | unknown[] | null>(null);

  readonly classes = computed(() => {
    const parts = ['btn', `btn--${this.variant()}`];
    if (this.size() === 'sm') {
      parts.push('btn--sm');
    }
    if (this.size() === 'lg') {
      parts.push('btn--lg');
    }
    if (this.block()) {
      parts.push('btn--block');
    }
    return parts.join(' ');
  });
}
