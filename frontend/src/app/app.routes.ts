import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProductsComponent } from './features/products/products.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { BrandsComponent } from './features/brands/brands.component';
import { BrandDetailComponent } from './features/brand-detail/brand-detail.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { CategoryDetailComponent } from './features/category-detail/category-detail.component';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  { path: 'products', component: ProductsComponent },
  { path: 'products/:slug', component: ProductDetailComponent },
  { path: 'brands', component: BrandsComponent },
  { path: 'brands/:slug', component: BrandDetailComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/:slug', component: CategoryDetailComponent },
  {
    path: 'cart',
    component: PlaceholderComponent,
    data: { titleKey: 'page.cart.title', messageKey: 'page.cart.message' },
  },

  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: 'profile',
    component: PlaceholderComponent,
    canActivate: [authGuard],
    data: { titleKey: 'page.profile.title', messageKey: 'page.profile.message' },
  },

  { path: '**', component: NotFoundComponent },
];
