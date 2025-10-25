// Cart types for users
export interface CartItem {
  _id: string;
  productId: string;
  productName: string;
  productImage?: string;
  productPrice: number;
  productDiscount?: number;
  finalPrice: number;
  quantity: number;
  totalPrice: number;
  shopId: string;
  shopName: string;
  addedAt: string;
}

export interface CartCoupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  description?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  coupon?: CartCoupon;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  shippingFee: number;
  totalAmount: number;
  itemCount: number;
  shopCount: number;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface AddCartItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface ApplyCouponRequest {
  couponCode: string;
}

// Response types
export interface CartResponse {
  cart: Cart;
}

export interface CartSummary {
  itemCount: number;
  shopCount: number;
  subtotal: number;
  totalAmount: number;
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
