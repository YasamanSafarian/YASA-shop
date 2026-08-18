export interface OrderItem {
  id: string;
  variantId: string;
  productName: string;
  productSlug: string;
  sku: string;
  format: string;
  volumeMl: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderAddress {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
}

export interface OrderStatuses {
  order: string;
  payment: string;
  shipment: string;
}

export interface OrderPayment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  transactionId: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  address: OrderAddress;
  statuses: OrderStatuses;
  customerNote: string | null;
  items: OrderItem[];
  payments: OrderPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrders {
  data: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
