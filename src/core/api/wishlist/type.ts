// Wishlist types for users
export interface WishlistItem {
  _id: string;
  productId: string;
  productName: string;
  productImage?: string;
  productPrice: number;
  productDiscount?: number;
  finalPrice: number;
  shopId: string;
  shopName: string;
  addedAt: string;
}

export interface Wishlist {
  _id: string;
  userId: string;
  items: WishlistItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface AddToWishlistRequest {
  productId: string;
}

// Response types
export interface WishlistResponse {
  wishlist: Wishlist;
}

export interface WishlistCheckResponse {
  isInWishlist: boolean;
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
