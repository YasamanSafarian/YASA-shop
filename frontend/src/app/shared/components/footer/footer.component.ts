import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly translate = inject(TranslateService);
}
