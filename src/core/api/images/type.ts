// Image types
export interface Image {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  tags?: string[];
  uploadedBy: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateImageRequest {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  tags?: string[];
}

export interface UpdateImageRequest {
  alt?: string;
  caption?: string;
  tags?: string[];
}

export interface ImageListQuery {
  page?: number;
  limit?: number;
  search?: string;
  mimeType?: string;
  uploadedBy?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Response types
export interface ImageListResponse {
  images: Image[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadResponse {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
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
