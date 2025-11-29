// Wallet types for users
export interface Wallet {
  _id: string;
  userId?: string;
  shopId?: string;
  balance: number;
  lastTransactionAt?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  isVerified?: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum WalletTransactionType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  PAYMENT = "payment",
  REFUND = "refund",
  TRANSFER = "transfer",
}

export enum WalletTransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface WalletTransaction {
  _id: string;
  userId: string;
  type: WalletTransactionType;
  amount: number;
  status: WalletTransactionStatus;
  description?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  qrCode?: string;
  transactionId?: string;
  orderId?: string;
  paymentId?: string;
  metadata?: Record<string, any>;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateDepositRequest {
  amount: number;
  description?: string;
  depositMethod?: "bank"; // Phương thức nạp tiền (Sepay qua chuyển khoản)
}

export interface WalletTransactionsQuery {
  page?: number;
  limit?: number;
  type?: WalletTransactionType;
  status?: WalletTransactionStatus;
}

// Response types
export interface WalletBalanceResponse {
  balance: number;
  wallet: Wallet;
  shopWallet?: Wallet | null;
  shop?: {
    _id: string;
    name: string;
  } | null;
}

export interface CreateDepositResponse {
  transaction: WalletTransaction;
  qrCode: string;
  paymentUrl?: string; // VNPay payment URL if enabled
  expiresAt?: string; // QR expiration time
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  instructions: string;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types
export interface UpdateBankInfoRequest {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  walletType?: "user" | "shop";
}

export interface TransferBetweenWalletsRequest {
  amount: number;
  from: "user" | "shop";
  to: "user" | "shop";
  description?: string;
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

