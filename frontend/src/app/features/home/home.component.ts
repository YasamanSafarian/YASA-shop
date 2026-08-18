import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonComponent } from '../../shared/components/ui/ui-button/ui-button.component';
import { TranslateService } from '../../core/services/translate.service';

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

  readonly current = signal(0);
  readonly animating = signal(false);

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
