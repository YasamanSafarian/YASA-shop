import { Component, inject } from '@angular/core';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-lang-switch',
  standalone: true,
  templateUrl: './lang-switch.component.html',
  styleUrl: './lang-switch.component.scss',
})
export class LangSwitchComponent {
  readonly translate = inject(TranslateService);
}
