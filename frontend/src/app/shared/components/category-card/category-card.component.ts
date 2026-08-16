import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryNode } from '../../../core/models/catalog';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss',
})
export class CategoryCardComponent {
  readonly category = input.required<CategoryNode>();
}
