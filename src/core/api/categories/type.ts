// Category types for users
export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  slug: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategory extends Category {
  parentId: string;
  parentCategory?: {
    _id: string;
    name: string;
    slug: string;
  };
}

// Request types
export interface CategoryListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  parentId?: string;
  sortBy?: "name" | "productCount" | "sortOrder";
  sortOrder?: "asc" | "desc";
}

// Response types
export interface CategoryListResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubCategoryListResponse {
  subCategories: SubCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PopularCategoriesResponse {
  categories: Array<Category & { productCount: number; trendingScore: number }>;
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
