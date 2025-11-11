// Product Attribute types for users
export interface ProductAttribute {
  _id: string;
  productId: string;
  product?: {
    _id: string;
    name: string;
  };
  attributeTypeId: string;
  attributeType?: {
    _id: string;
    name: string;
    description?: string;
  };
  combination: Record<string, string | number>;
  price: number;
  stock?: number;
  image_url?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface ProductAttributeListQuery {
  page?: number;
  limit?: number;
  productId?: string;
  attributeTypeId?: string;
}

// Response types
export interface ProductAttributeListResponse {
  productAttributes: ProductAttribute[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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

