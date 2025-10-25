// Review types for users
export interface Review {
  _id: string;
  productId: string;
  product?: {
    _id: string;
    name: string;
    image?: string;
  };
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
  isHelpful?: boolean; // whether current user marked as helpful
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface ReviewListQuery {
  page?: number;
  limit?: number;
  productId?: string;
  userId?: string;
  rating?: number;
  sortBy?: "createdAt" | "rating" | "helpfulCount";
  sortOrder?: "asc" | "desc";
}

// Response types
export interface ReviewListResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
  recentReviews: Review[];
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
