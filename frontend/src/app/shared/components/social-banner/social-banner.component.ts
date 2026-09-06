import { Component, inject } from '@angular/core';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-social-banner',
  standalone: true,
  templateUrl: './social-banner.component.html',
  styleUrl: './social-banner.component.scss',
})
export class SocialBannerComponent {
  readonly translate = inject(TranslateService);

  readonly items = [
    {
      icon: 'instagram',
      label: 'Instagram',
      handle: 'the_yasa.store',
    },
    {
      icon: 'telegram',
      label: 'Telegram',
      handle: 'the_yasa',
    },
  ];
}
