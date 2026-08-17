import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { TranslateService } from '../../../core/services/translate.service';
import { LangSwitchComponent } from '../lang-switch/lang-switch.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LangSwitchComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  mobileOpen = false;

  toggleMenu(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  displayName(): string {
    const user = this.auth.user();
    if (!user) {
      return '';
    }
    return user.firstName || user.lastName || user.email || user.phone;
  }

  async logout(): Promise<void> {
    this.mobileOpen = false;
    await this.auth.logout();
    await this.router.navigate(['/']);
  }
}
