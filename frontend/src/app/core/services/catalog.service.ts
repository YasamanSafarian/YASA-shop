import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Brand,
  BrandDetail,
  CategoryNode,
  ListProductsParams,
  PaginatedProducts,
  Product,
} from '../models/catalog';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(ApiService);

  listProducts(params?: ListProductsParams): Observable<PaginatedProducts> {
    return this.api.get<PaginatedProducts>('/products', params);
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.api.get<Product>(`/products/${slug}`);
  }

  listBrands(): Observable<Brand[]> {
    return this.api.get<Brand[]>('/brands');
  }

  getBrandBySlug(slug: string): Observable<BrandDetail> {
    return this.api.get<BrandDetail>(`/brands/${slug}`);
  }

  getCategoryTree(): Observable<CategoryNode[]> {
    return this.api.get<CategoryNode[]>('/categories');
  }
}
