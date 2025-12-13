// Chart data types for Shop Analytics

export interface RevenueData {
  date: string;
  revenue: number; // Doanh thu
  profit: number;  // Lợi nhuận
}

export interface WalletTransactionData {
  month: string;
  income: number;  // Tiền bán hàng/Nạp vào
  expense: number; // Rút tiền/Hoàn tiền/Phí sàn
}

export interface OrderStatusData {
  status: string;
  count: number;
  fill: string; // Mã màu hex để Recharts render đúng màu
}

// Enhanced order status enum for consistent mapping
export enum OrderStatus {
  PENDING = "Chờ xác nhận",
  CONFIRMED = "Đã xác nhận",
  PROCESSING = "Đang xử lý",
  SHIPPED = "Đang giao",
  DELIVERED = "Hoàn thành",
  CANCELLED = "Đã hủy",
  RETURNED = "Hoàn trả",
}