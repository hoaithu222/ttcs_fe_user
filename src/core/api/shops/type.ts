// Shop types for users
export interface Shop {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  ownerId: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  followersCount?: number;
  productsCount?: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopProduct {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  discount?: number;
  finalPrice: number;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  isActive: boolean;
  createdAt: string;
}

export interface ShopReview {
  _id: string;
  userId: string;
  user?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

// Request types
export interface ShopListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isVerified?: boolean;
  minRating?: number;
  sortBy?: "name" | "rating" | "followersCount" | "productsCount" | "createdAt";
  sortOrder?: "asc" | "desc";
  location?: {
    lat: number;
    lng: number;
    radius?: number; // in km
  };
}

export interface ShopProductsQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  subCategoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "createdAt" | "price" | "rating" | "salesCount";
  sortOrder?: "asc" | "desc";
  inStock?: boolean;
  onSale?: boolean;
}

export interface NearbyShopsQuery {
  lat: number;
  lng: number;
  radius?: number; // in km
  limit?: number;
}

// Response types
export interface ShopListResponse {
  shops: Shop[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ShopDetailResponse {
  shop: Shop;
  recentProducts: ShopProduct[];
  reviews: {
    averageRating: number;
    totalReviews: number;
    recentReviews: ShopReview[];
  };
}

export interface ShopProductsResponse {
  products: ShopProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FollowStatusResponse {
  isFollowing: boolean;
  followersCount: number;
}

export interface NearbyShopsResponse {
  shops: Array<Shop & { distance: number }>;
}

export interface ShopStatusResponse {
  shopStatus: "not_registered" | "pending_review" | "approved" | "rejected" | "active" | "blocked" | "suspended";
  shop: {
    id: string;
    name: string;
    slug?: string;
    status: string;
  } | null;
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
