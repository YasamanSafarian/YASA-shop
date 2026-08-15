import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './placeholder.component.html',
  styleUrl: './placeholder.component.scss',
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title = signal('Coming soon');
  readonly message = signal<string | null>(null);

  constructor() {
    this.route.data.subscribe((data) => {
      this.title.set((data['title'] as string) ?? 'Coming soon');
      this.message.set((data['message'] as string | null) ?? null);
    });
  }
}
