import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { UiStateComponent } from '../../shared/components/ui/ui-state/ui-state.component';
import { CatalogService } from '../../core/services/catalog.service';
import { TranslateService } from '../../core/services/translate.service';
import { CategoryNode, Product } from '../../core/models/catalog';
import { getErrorMessage } from '../../shared/utils/errors';

const PAGE_SIZE = 48;

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, UiStateComponent],
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss',
})
export class CategoryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  readonly translate = inject(TranslateService);

  readonly products = signal<Product[]>([]);
  readonly categoryName = signal<string | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly loaded = computed(() => !this.loading() && !this.error());

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.error.set('missing slug');
        this.loading.set(false);
        return;
      }
      this.load(slug);
    });
  }

  private load(slug: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.catalog.listProducts({ category: slug, limit: PAGE_SIZE }).subscribe({
      next: (result) => {
        this.products.set(result.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(getErrorMessage(err));
        this.loading.set(false);
      },
    });

    this.catalog.getCategoryTree().subscribe({
      next: (tree) => {
        const match = this.findBySlug(tree, slug);
        this.categoryName.set(match?.name ?? null);
      },
      error: () => this.categoryName.set(null),
    });
  }

  private findBySlug(nodes: CategoryNode[], slug: string): CategoryNode | null {
    for (const node of nodes) {
      if (node.slug === slug) {
        return node;
      }
      const child = this.findBySlug(node.children, slug);
      if (child) {
        return child;
      }
    }
    return null;
  }
}
