// Attribute Value types for users
export interface AttributeValue {
  _id: string;
  attributeTypeId: string;
  attributeType?: {
    _id: string;
    name: string;
    code: string;
    inputType: string;
  };
  value: string;
  label: string;
  colorCode?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface AttributeValueListQuery {
  page?: number;
  limit?: number;
  search?: string;
  attributeTypeId?: string;
  isActive?: boolean;
  sortBy?: "label" | "value" | "sortOrder" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// Response types
export interface AttributeValueListResponse {
  attributeValues: AttributeValue[];
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

