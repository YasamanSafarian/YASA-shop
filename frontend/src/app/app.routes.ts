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
import { CartComponent } from './features/cart/cart.component';
import { OrderConfirmationComponent } from './features/order-confirmation/order-confirmation.component';
import { ProfileComponent } from './features/profile/profile.component';
import { AdminOrdersComponent } from './features/admin/admin-orders.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  { path: 'products', component: ProductsComponent },
  { path: 'products/:slug', component: ProductDetailComponent },
  { path: 'brands', component: BrandsComponent },
  { path: 'brands/:slug', component: BrandDetailComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/:slug', component: CategoryDetailComponent },
  { path: 'cart', component: CartComponent },
  {
    path: 'order-confirmation',
    component: OrderConfirmationComponent,
  },

  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },

  {
    path: 'admin/orders',
    component: AdminOrdersComponent,
    canActivate: [authGuard, adminGuard],
  },

  { path: '**', component: NotFoundComponent },
];
