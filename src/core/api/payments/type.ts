// Payment types for users
export interface Payment {
  _id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method:
    | "cod"
    | "bank_transfer"
    | "credit_card"
    | "paypal"
    | "vnpay"
    | "momo"
    | "zalopay"
    | "test";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded";
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  paidAt?: string;
  instructions?: string;
  qrCode?: string;
  returnUrl?: string;
  cancelUrl?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type:
    | "cod"
    | "bank_transfer"
    | "credit_card"
    | "paypal"
    | "vnpay"
    | "momo"
    | "zalopay"
    | "test";
  isActive: boolean;
  config?: Record<string, any>;
  icon?: string;
  description?: string;
}

// Request types
export interface CheckoutRequest {
  orderId: string;
  paymentMethod: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentHistoryQuery {
  page?: number;
  limit?: number;
  status?: Payment["status"];
  method?: Payment["method"];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Response types
export interface CheckoutResponse {
  paymentUrl?: string;
  paymentId: string;
  qrCode?: string;
  instructions?: string;
  expiresAt?: string;
}

export interface PaymentStatusResponse {
  payment: Payment;
  status: Payment["status"];
}

export interface PaymentHistoryResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentMethodsResponse {
  methods: PaymentMethod[];
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
