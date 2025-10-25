// Order types for users
export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  discount?: number;
  totalPrice: number;
  shopId: string;
  shopName: string;
}

export interface OrderTracking {
  status: Order["orderStatus"];
  timestamp: string;
  location?: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    isDefault?: boolean;
  };
  paymentMethod: "cod" | "bank_transfer" | "credit_card" | "paypal";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  trackingNumber?: string;
  trackingHistory?: OrderTracking[];
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  paymentMethod: "cod" | "bank_transfer" | "credit_card" | "paypal";
  notes?: string;
  couponCode?: string;
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  orderStatus?: Order["orderStatus"];
  paymentStatus?: Order["paymentStatus"];
  paymentMethod?: Order["paymentMethod"];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "totalAmount" | "orderStatus";
  sortOrder?: "asc" | "desc";
}

// Response types
export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderDetailResponse {
  order: Order;
  canCancel: boolean;
  canReorder: boolean;
  estimatedDelivery?: string;
}

export interface OrderTrackResponse {
  order: Order;
  trackingHistory: OrderTracking[];
  currentLocation?: string;
  estimatedDelivery?: string;
}

// API response wrapper
export interface ApiSuccess<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  timestamp: string;
  code: number;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
  path: string;
  method: string;
  code: number;
}
