import { Component, input } from '@angular/core';

export interface StepperStep {
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-ui-stepper',
  standalone: true,
  templateUrl: './ui-stepper.component.html',
  styleUrl: './ui-stepper.component.scss',
})
export class UiStepperComponent {
  readonly steps = input.required<StepperStep[]>();
  readonly currentStep = input<number>(0);
}
