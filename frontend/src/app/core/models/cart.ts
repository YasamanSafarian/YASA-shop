export interface CartItem {
  id: string;
  quantity: number;
  lineTotal: number;
  variant: {
    id: string;
    sku: string;
    format: string;
    volumeMl: number;
    price: number;
    compareAtPrice: number | null;
    stockQuantity: number;
    weight: number | null;
    imageUrl: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
      gender: string | null;
      concentration: string | null;
      brand: { id: string; name: string; slug: string };
    };
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
  totals: {
    distinctItems: number;
    itemCount: number;
    subtotal: number;
  };
  createdAt: string;
  updatedAt: string;
}
