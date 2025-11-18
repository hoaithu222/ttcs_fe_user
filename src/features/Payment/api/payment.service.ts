import { userPaymentsApi } from "@/core/api/payments";
import type {
  CheckoutRequest,
  PaymentHistoryQuery,
  ApiSuccess,
  CheckoutResponse,
  PaymentStatusResponse,
  PaymentHistoryResponse,
  PaymentMethodsResponse,
} from "@/core/api/payments/type";

export class PaymentService {
  // Create checkout
  async createCheckout(data: CheckoutRequest): Promise<ApiSuccess<CheckoutResponse>> {
    return await userPaymentsApi.createCheckout(data);
  }

  // Get payment methods
  async getPaymentMethods(): Promise<ApiSuccess<PaymentMethodsResponse>> {
    return await userPaymentsApi.getPaymentMethods();
  }

  // Get payment status
  async getPaymentStatus(orderId: string): Promise<ApiSuccess<PaymentStatusResponse>> {
    return await userPaymentsApi.getPaymentStatus(orderId);
  }

  // Get payment history
  async getPaymentHistory(
    query?: PaymentHistoryQuery
  ): Promise<ApiSuccess<PaymentHistoryResponse>> {
    return await userPaymentsApi.getPaymentHistory(query);
  }
}

export const paymentService = new PaymentService();
