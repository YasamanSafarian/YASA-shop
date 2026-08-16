import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type Lang = 'en' | 'fa';

const LANG_STORAGE_KEY = 'yasa.lang';

type Dictionary = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly http = inject(HttpClient);

  private readonly langSignal = signal<Lang>(this.loadInitialLang());
  private readonly dictionaries = signal<Partial<Record<Lang, Dictionary>>>({});
  private readonly loadedSignal = signal(false);

  readonly lang = this.langSignal.asReadonly();
  readonly dir = computed(() => (this.lang() === 'fa' ? 'rtl' : 'ltr'));
  readonly loaded = this.loadedSignal.asReadonly();

  /**
   * Loads both translation files into memory. Called once at application
   * startup via APP_INITIALIZER so that switching languages is instant.
   */
  async load(): Promise<void> {
    const [en, fa] = await Promise.all([
      this.loadDictionary('en'),
      this.loadDictionary('fa'),
    ]);
    this.dictionaries.set({ en, fa });
    this.loadedSignal.set(true);
    this.applyToDocument();
  }

  switchLang(lang: Lang): void {
    if (lang === this.langSignal()) {
      return;
    }
    this.langSignal.set(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    this.applyToDocument();
  }

  t(key: string): string {
    const dictionaries = this.dictionaries();
    const current = dictionaries[this.lang()];
    const english = dictionaries['en'];
    return current?.[key] ?? english?.[key] ?? key;
  }

  private async loadDictionary(lang: Lang): Promise<Dictionary> {
    try {
      const dictionary = await firstValueFrom(
        this.http.get<Dictionary>(`assets/i18n/${lang}.json`),
      );
      return dictionary ?? {};
    } catch {
      return {};
    }
  }

  private applyToDocument(): void {
    document.documentElement.lang = this.langSignal();
    document.documentElement.dir = this.dir();
    document.title = this.t('meta.title');
  }

  private loadInitialLang(): Lang {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'fa';
  }
}
