// Attribute Type types for users
export interface AttributeType {
  _id: string;
  name: string;
  code: string;
  inputType: "text" | "number" | "select" | "multiselect" | "boolean" | "date" | "color";
  description?: string;
  isRequired: boolean;
  isActive: boolean;
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface AttributeTypeListQuery {
  page?: number;
  limit?: number;
  search?: string;
  inputType?: AttributeType["inputType"];
  isActive?: boolean;
  sortBy?: "name" | "code" | "sortOrder" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// Response types
export interface AttributeTypeListResponse {
  attributeTypes: AttributeType[];
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
