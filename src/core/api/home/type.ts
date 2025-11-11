import { Category } from "../categories/type";
import { Product } from "../products/type";
import { Shop } from "../shops/type";

// Home Banner Response
export interface HomeBannerResponse {
  banners: Array<{
    _id: string;
    title?: string;
    description?: string;
    image: string;
    link?: string;
    order: number;
    isActive: boolean;
  }>;
}

// Home Categories Response
export interface HomeCategoriesResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Home Best Seller Response
export interface HomeBestSellerResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Home Best Shops Response
export interface HomeBestShopsResponse {
  shops: Shop[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Home Flash Sale Response
export interface HomeFlashSaleResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  flashSaleInfo?: {
    startTime: string;
    endTime: string;
    discountPercent: number;
  };
}

// Home Search Suggestion Response
export interface HomeSearchSuggestionResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  suggestions?: string[];
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
