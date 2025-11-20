import type { Product, ProductVariant } from "../products/type";

export interface CartVariantSnapshot {
  attributes?: Record<string, string>;
  sku?: string;
  price?: number;
  image?: string;
}

// Cart types for users
export interface CartItem {
  _id: string;
  cartId: string;
  productId: string | {
    _id: string;
    name: string;
    images: Array<{ url: string; publicId?: string }> | string[];
    price: number;
    discount?: number;
    stock?: number;
  };
  variantId?: string | ProductVariant;
  quantity: number;
  priceAtTime: number;
  shopId: string | {
    _id: string;
    name: string;
    logo?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  // Computed fields for frontend
  productName?: string;
  productImage?: string;
  productPrice?: number;
  finalPrice?: number;
  totalPrice?: number;
  shopName?: string;
  variantSnapshot?: CartVariantSnapshot;
  product?: Partial<Product>;
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
  cartItems: CartItem[]; // Backend uses cartItems
  items?: CartItem[]; // Alias for cartItems for frontend compatibility
  status?: string;
  coupon?: CartCoupon;
  subtotal?: number; // Computed
  discount?: number; // Computed
  couponDiscount?: number; // Computed
  shippingFee?: number; // Computed
  totalAmount?: number; // Computed
  itemCount?: number; // Computed
  shopCount?: number; // Computed
  createdAt?: string;
  updatedAt?: string;
}

// Request types
export interface AddCartItemRequest {
  productId: string;
  variantId?: string; // Optional, for products with variants
  quantity: number;
  priceAtTime?: number; // Price at the time of adding to cart
  shopId: string;
}

export interface UpdateCartItemRequest {
  quantity?: number;
  variantId?: string;
  priceAtTime?: number;
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
