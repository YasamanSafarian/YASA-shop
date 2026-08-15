export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productCount: number;
}

export interface BrandDetail {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  products: Product[];
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  children: CategoryNode[];
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string | null;
  format: string;
  volumeMl: number;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  weight: number | null;
  isDefault: boolean;
  isActive: boolean;
  images: ProductImage[];
}

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface FragranceFamily {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  gender: string | null;
  concentration: string | null;
  releaseYear: number | null;
  seasons: string[];
  occasions: string[];
  brand: ProductBrand;
  categories: ProductCategory[];
  variants: ProductVariant[];
  notes: { top: string[]; middle: string[]; base: string[] };
  fragranceFamilies: FragranceFamily[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ProductSort =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc';

export interface ListProductsParams {
  search?: string;
  brand?: string;
  category?: string;
  gender?: 'male' | 'female' | 'unisex';
  minPrice?: number;
  maxPrice?: number;
  availability?: 'in_stock';
  sort?: ProductSort;
  page?: number;
  limit?: number;
}
