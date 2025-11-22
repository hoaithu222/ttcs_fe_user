// Chat types for users
export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  message: string;
  attachments?: Array<{
    id?: string;
    url: string;
    type: string;
    name?: string;
  }>;
  metadata?: Record<string, any>;
  isRead?: boolean;
  isDelivered?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatConversation {
  _id: string;
  participants: Array<{
    userId: string;
    name?: string;
    avatar?: string;
    role?: string;
  }>;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  type?: "direct" | "group" | "admin" | "shop" | "ai";
  channel?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

// Request types
export interface ConversationListQuery {
  page?: number;
  limit?: number;
  type?: ChatConversation["type"];
  channel?: string;
}

export interface MessageListQuery {
  page?: number;
  limit?: number;
  before?: string; // messageId to fetch messages before
  after?: string; // messageId to fetch messages after
}

export interface SendMessageRequest {
  message: string;
  attachments?: Array<{
    url: string;
    type: string;
    name?: string;
  }>;
  metadata?: Record<string, any>;
}

// Response types
export interface ConversationListResponse {
  conversations: ChatConversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessageListResponse {
  messages: ChatMessage[];
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

