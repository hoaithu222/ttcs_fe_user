import { ReduxStateType } from "@/app/store/types";
import type {
  Payment,
  PaymentMethod,
  CheckoutRequest,
  CheckoutResponse,
  PaymentHistoryQuery,
} from "@/core/api/payments/type";

export interface PaymentState {
  // Checkout
  checkout: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    data: CheckoutResponse | null;
  };

  // Payment Methods
  paymentMethods: {
    status: ReduxStateType;
    error: string | null;
    data: PaymentMethod[];
  };

  // Payment Status
  paymentStatus: {
    status: ReduxStateType;
    error: string | null;
    data: Payment | null;
  };

  // Payment History
  paymentHistory: {
    status: ReduxStateType;
    error: string | null;
    data: Payment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
