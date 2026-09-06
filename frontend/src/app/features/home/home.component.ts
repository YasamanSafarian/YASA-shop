import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { TranslateService } from '../../core/services/translate.service';
import { CatalogService } from '../../core/services/catalog.service';
import { Product } from '../../core/models/catalog';

interface Slide {
  image: string;
  titleKey: string;
  subtitleKey: string;
  link: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, UiButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly translate = inject(TranslateService);
  private readonly catalog = inject(CatalogService);

  readonly current = signal(0);
  readonly animating = signal(false);
  readonly featuredProducts = signal<Product[]>([]);
  readonly featuredLoading = signal(false);
  readonly discountedProducts = signal<Product[]>([]);
  readonly discountedLoading = signal(false);
  readonly mostPopularPerfumes = signal<Product[]>([]);
  readonly mostPopularLoading = signal(false);

  readonly slides: Slide[] = [
    {
      image: 'assets/images/hero/slide-women.png',
      titleKey: 'home.slide.women.title',
      subtitleKey: 'home.slide.women.subtitle',
      link: ['/products'],
    },
    {
      image: 'assets/images/hero/slide-men.png',
      titleKey: 'home.slide.men.title',
      subtitleKey: 'home.slide.men.subtitle',
      link: ['/products'],
    },
    {
      image: 'assets/images/hero/slide-unisex.png',
      titleKey: 'home.slide.unisex.title',
      subtitleKey: 'home.slide.unisex.subtitle',
      link: ['/products'],
    },
  ];

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startAuto();
    this.loadFeatured();
    this.loadDiscounted();
    this.loadMostPopularPerfumes();
  }

  ngOnDestroy(): void {
    this.stopAuto();
  }

  goTo(index: number): void {
    if (index === this.current() || this.animating()) return;
    this.animating.set(true);
    this.current.set(index);
    setTimeout(() => this.animating.set(false), 600);
    this.restartAuto();
  }

  next(): void {
    this.goTo((this.current() + 1) % this.slides.length);
  }

  prev(): void {
    this.goTo((this.current() - 1 + this.slides.length) % this.slides.length);
  }

  scrollFeatured(direction: 'left' | 'right', el: HTMLElement): void {
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  scrollDiscounted(direction: 'left' | 'right', el: HTMLElement): void {
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  getPrimaryImage(product: Product): string {
    for (const v of product.variants) {
      const primary = v.images.find(i => i.isPrimary);
      if (primary) return primary.imageUrl;
      if (v.images.length) return v.images[0].imageUrl;
    }
    return '';
  }

  getMinPrice(product: Product): number {
    const prices = product.variants.map(v => v.price).filter(p => p > 0);
    return prices.length ? Math.min(...prices) : 0;
  }

  getCompareAt(product: Product): number | null {
    const variants = product.variants;
    if (variants.length === 0) return null;
    const cheapest = variants.reduce((a, b) => (a.price <= b.price ? a : b));
    if (cheapest.compareAtPrice != null && cheapest.compareAtPrice > cheapest.price) {
      return cheapest.compareAtPrice;
    }
    return null;
  }

  private loadFeatured(): void {
    this.featuredLoading.set(true);
    this.catalog.listProducts({ limit: 8, sort: 'newest' }).subscribe({
      next: res => {
        this.featuredProducts.set(res.data);
        this.featuredLoading.set(false);
      },
      error: () => this.featuredLoading.set(false),
    });
  }

  private loadDiscounted(): void {
    this.discountedLoading.set(true);
    this.catalog.listProducts({ limit: 100, discounted: true }).subscribe({
      next: res => {
        this.discountedProducts.set(res.data);
        this.discountedLoading.set(false);
      },
      error: () => this.discountedLoading.set(false),
    });
  }

  private loadMostPopularPerfumes(): void {
    this.mostPopularLoading.set(true);
    this.catalog.listProducts({ type: 'perfume', limit: 8, sort: 'newest' }).subscribe({
      next: res => {
        this.mostPopularPerfumes.set(res.data);
        this.mostPopularLoading.set(false);
      },
      error: () => this.mostPopularLoading.set(false),
    });
  }

  private startAuto(): void {
    this.timer = setInterval(() => this.next(), 5000);
  }

  private stopAuto(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private restartAuto(): void {
    this.stopAuto();
    this.startAuto();
  }
}
