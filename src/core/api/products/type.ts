// Product types for users
export interface ProductVariant {
  _id?: string;
  id?: string;
  attributes: Record<string, string>; // { "Màu sắc": "Đỏ", "Kích thước": "M" }
  price: number;
  stock: number;
  image?: string | null | { url: string };
  sku?: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  shopId: string;
  shop?: {
    _id: string;
    name: string;
    logo?: string;
    rating?: number;
  };
  subCategoryId: string;
  subCategory?: {
    _id: string;
    name: string;
    slug: string;
  };
  categoryId: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  price: number;
  discount?: number;
  finalPrice: number;
  stock?: number;
  variants?: ProductVariant[];
  warrantyInfo: string;
  weight?: number;
  dimensions: string;
  metaKeywords: string;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  viewCount?: number;
  isInWishlist?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  _id: string;
  userId: string;
  user?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
}

// Request types
export interface ProductListQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  subCategoryId?: string;
  shopId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: "createdAt" | "price" | "rating" | "salesCount" | "viewCount" | "popularity";
  sortOrder?: "asc" | "desc";
  inStock?: boolean;
  onSale?: boolean;
}

export interface ProductSearchQuery {
  q: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  subCategoryId?: string;
  shopId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: "relevance" | "price" | "rating" | "salesCount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface RelatedProductsQuery {
  limit?: number;
  excludeId?: string;
}

// Response types
export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    categories: Array<{ _id: string; name: string; count: number }>;
    priceRange: { min: number; max: number };
    ratings: Array<{ rating: number; count: number }>;
  };
}

export interface ProductDetailResponse {
  product: Product;
  relatedProducts: Product[];
  reviews: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<string, number>;
    recentReviews: ProductReview[];
  };
}

export interface ProductSearchResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchSuggestion?: string[];
  filters?: {
    categories: Array<{ _id: string; name: string; count: number }>;
    shops: Array<{ _id: string; name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
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
