import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  {
    path: 'products',
    component: PlaceholderComponent,
    data: {
      title: 'Perfumes',
      message: 'Our full collection is being curated and will be here soon.',
    },
  },
  {
    path: 'products/:slug',
    component: PlaceholderComponent,
    data: {
      title: 'Product',
      message: 'Product details are on the way.',
    },
  },
  {
    path: 'brands',
    component: PlaceholderComponent,
    data: {
      title: 'Brands',
      message: 'World-renowned houses and YASA originals, coming soon.',
    },
  },
  {
    path: 'brands/:slug',
    component: PlaceholderComponent,
    data: {
      title: 'Brand',
      message: 'Brand details are on the way.',
    },
  },
  {
    path: 'categories',
    component: PlaceholderComponent,
    data: {
      title: 'Categories',
      message: 'Browse our curated collections, coming soon.',
    },
  },
  {
    path: 'categories/:slug',
    component: PlaceholderComponent,
    data: {
      title: 'Category',
      message: 'Category products are on the way.',
    },
  },
  {
    path: 'cart',
    component: PlaceholderComponent,
    data: {
      title: 'Shopping Cart',
      message: 'Your cart will appear here.',
    },
  },

  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: 'profile',
    component: PlaceholderComponent,
    canActivate: [authGuard],
    data: {
      title: 'My Profile',
      message: 'Your profile details are on the way.',
    },
  },

  { path: '**', component: NotFoundComponent },
];
