import {
  Component,
  computed,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

export interface UiSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-ui-select',
  standalone: true,
  templateUrl: './ui-select.component.html',
  styleUrl: './ui-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true,
    },
  ],
})
export class UiSelectComponent implements ControlValueAccessor {
  readonly id = input('select');
  readonly label = input<string | null>(null);
  readonly placeholder = input<string | null>(null);
  readonly options = input<UiSelectOption[]>([]);
  readonly error = input<string | null>(null);
  readonly dense = input(false);

  private readonly ngControl = inject(NgControl, {
    optional: true,
    self: true,
  });

  value = '';
  disabled = false;
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  readonly invalid = computed(
    () =>
      this.error() !== null ||
      (!!this.ngControl?.control?.invalid && !!this.ngControl?.control?.touched),
  );

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelect(event: Event): void {
    this.value = (event.target as HTMLSelectElement).value;
    this.onChange(this.value);
    this.onTouched();
  }
}
