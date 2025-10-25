// Address types for users
export interface Address {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
  type: "home" | "office" | "other";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateAddressRequest {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault?: boolean;
  type?: "home" | "office" | "other";
  notes?: string;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  _id: string;
}

// Response types
export interface AddressListResponse {
  addresses: Address[];
  defaultAddress?: Address;
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
