import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  readonly translate = inject(TranslateService);
}
