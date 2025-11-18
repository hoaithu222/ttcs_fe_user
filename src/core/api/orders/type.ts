// Order types for users
export interface OrderItem {
  _id?: string;
  productId: string | { _id: string; name: string };
  variantId?: string | { _id: string; attributes: Record<string, string> };
  quantity: number;
  price: number;
  discount?: number;
  totalPrice: number;
  tax?: number;
}

export interface OrderTracking {
  status: Order["orderStatus"];
  timestamp: string;
  location?: string;
  note?: string;
}

export interface Order {
  _id: string;
  userId: string;
  shopId: string | { _id: string; name: string };
  orderItems: OrderItem[];
  orderHistory?: Array<{
    _id: string;
    status: Order["orderStatus"];
    description?: string;
    createdAt?: string;
  }>;
  paymentMethod: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderStatus?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus?:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  totalAmount: number;
  shippingFee: number;
  discountAmount?: number;
  notes?: string;
  addressId: string | {
    _id: string;
    fullName?: string;
    phone?: string;
    address?: string;
  };
  isPay: boolean;
  createdAt: string;
  updatedAt: string;
  orderNumber?: string;
  trackingNumber?: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
  };
  items?: Array<{
    productName?: string;
    quantity: number;
    totalPrice: number;
  }>;
  shippingAddress?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    district?: string;
    ward?: string;
  };
}

export interface CreateOrderItemRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  discount?: number;
  tax?: number;
}

// Request types
export interface CreateOrderRequest {
  shopId: string;
  addressId: string;
  paymentMethod: string;
  shippingFee: number;
  items: CreateOrderItemRequest[];
  notes?: string;
  voucherId?: string;
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
