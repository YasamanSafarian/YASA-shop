import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, UiButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly translate = inject(TranslateService);
}
