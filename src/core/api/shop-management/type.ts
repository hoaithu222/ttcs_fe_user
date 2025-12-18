// Shop Management types
export interface ShopInfo {
  _id: string;
  userId?: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string; // Backend uses 'banner', not 'coverImage'
  coverImage?: string; // Alias for banner for frontend compatibility
  address?: string;
  phone?: string; // Alias for contactPhone
  contactPhone?: string; // Backend field name
  email?: string; // Alias for contactEmail
  contactEmail?: string; // Backend field name
  contactName?: string;
  website?: string;
  ownerId?: string;
  isActive?: boolean;
  status?: string; // Backend uses 'status' field
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  followCount?: number; // Backend field name
  followersCount?: number; // Alias for followCount
  productCount?: number; // Backend field name
  productsCount?: number; // Alias for productCount
  totalRevenue?: number;
  slug?: string;
  businessType?: string;
  taxId?: string;
  repId?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  idCardImages?: string[];
  businessLicenseImages?: string[];
  shippingPolicy?: string;
  returnPolicy?: string;
  openHour?: string;
  closeHour?: string;
  workingDays?: string;
  facebook?: string;
  zalo?: string;
  instagram?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopProductVariant {
  _id?: string;
  id?: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  image?: string | null | { url: string };
  sku?: string;
}

export interface ShopProduct {
  _id: string;
  name: string;
  description?: string;
  images: string[] | Array<{ _id: string; url: string; publicId?: string }>;
  subCategoryId: string;
  categoryId: string;
  price: number;
  discount?: number;
  stock?: number;
  warrantyInfo: string;
  weight?: number;
  dimensions: string;
  metaKeywords: string;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  viewCount?: number;
  variants?: ShopProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ShopOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber?: string;
  notes?: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateShopRequest {
  name: string;
  slug: string;
  description: string;
  logo: string; // Image ID or URL
  banner: string; // Image ID or URL
  // Contact information
  contactEmail: string;
  contactPhone: string;
  contactName: string;
  // Address
  address: {
    provinceCode: number | string;
    districtCode: number | string;
    wardCode: number | string;
  };
  // Business information
  businessType: "individual" | "household" | "enterprise";
  taxId?: string;
  repId: string;
  // Bank information
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  // Documents
  idCardImages?: string[]; // Image IDs or URLs
  businessLicenseImages?: string[]; // Image IDs or URLs
  // Setup information
  shippingPolicy?: string;
  returnPolicy?: string;
  openHour?: string;
  closeHour?: string;
  workingDays?: string;
  facebook?: string;
  zalo?: string;
  instagram?: string;
}

export interface UpdateShopRequest extends Partial<CreateShopRequest> {}

export type ProductImageInput = string | { _id?: string; url: string; publicId?: string };

export interface CreateProductRequest {
  name: string;
  description?: string;
  images: ProductImageInput[];
  subCategoryId: string;
  categoryId: string;
  price: number;
  discount?: number;
  stock?: number;
  warrantyInfo: string;
  weight?: number;
  dimensions: string;
  metaKeywords: string;
  isActive?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface UpdateOrderStatusRequest {
  orderStatus: string;
  trackingNumber?: string;
  notes?: string;
}

export interface ShopProductsQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  subCategoryId?: string;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ShopOrdersQuery {
  page?: number;
  limit?: number;
  orderStatus?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Response types
export interface ShopProductsResponse {
  products: ShopProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ShopOrdersResponse {
  orders: ShopOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderStatistics {
  [key: string]: any;
  all: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned?: number;
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
