import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const savedLang = localStorage.getItem('yasa.lang');
if (savedLang === 'fa') {
  document.documentElement.lang = 'fa';
  document.documentElement.dir = 'rtl';
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
