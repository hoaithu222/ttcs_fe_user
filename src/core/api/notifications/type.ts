// Notification types for users
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "system" | "product" | "shop" | "review";
  isRead: boolean;
  data?: Record<string, any>;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

// Request types
export interface NotificationListQuery {
  page?: number;
  limit?: number;
  type?: Notification["type"];
  isRead?: boolean;
  sortBy?: "createdAt" | "readAt";
  sortOrder?: "asc" | "desc";
}

// Response types
export interface NotificationListResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
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
