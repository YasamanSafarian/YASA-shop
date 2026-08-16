import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './placeholder.component.html',
  styleUrl: './placeholder.component.scss',
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  readonly translate = inject(TranslateService);

  readonly titleKey = signal('placeholder.comingSoon');
  readonly messageKey = signal<string | null>(null);

  constructor() {
    this.route.data.subscribe((data) => {
      this.titleKey.set((data['titleKey'] as string) ?? 'placeholder.comingSoon');
      this.messageKey.set((data['messageKey'] as string | null) ?? null);
    });
  }
}
