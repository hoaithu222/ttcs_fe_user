import { USER_PAYMENTS_ENDPOINTS, buildEndpoint } from "./path";
import type {
  CheckoutRequest,
  PaymentHistoryQuery,
  CheckoutResponse,
  PaymentStatusResponse,
  PaymentHistoryResponse,
  PaymentMethodsResponse,
  ApiSuccess,
} from "./type";
import { UserHttpClient } from "@/core/base/http-client";

// Payments API service for users
class UserPaymentsApiService extends UserHttpClient {
  constructor() {
    super(import.meta.env.VITE_API_BASE_URL || "");
  }

  // Create payment checkout
  async createCheckout(data: CheckoutRequest): Promise<ApiSuccess<CheckoutResponse>> {
    const response = await this.post(USER_PAYMENTS_ENDPOINTS.CHECKOUT, data);
    return response.data;
  }

  // Get payment status
  async getPaymentStatus(orderId: string): Promise<ApiSuccess<PaymentStatusResponse>> {
    const endpoint = buildEndpoint(USER_PAYMENTS_ENDPOINTS.STATUS, { orderId });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Get payment history
  async getPaymentHistory(
    query?: PaymentHistoryQuery
  ): Promise<ApiSuccess<PaymentHistoryResponse>> {
    const response = await this.get(USER_PAYMENTS_ENDPOINTS.HISTORY, { params: query });
    return response.data;
  }

  // Get available payment methods
  async getPaymentMethods(): Promise<ApiSuccess<PaymentMethodsResponse>> {
    const response = await this.get(USER_PAYMENTS_ENDPOINTS.METHODS);
    return response.data;
  }
}

// Export singleton instance
export const userPaymentsApi = new UserPaymentsApiService();

// Export default
export default userPaymentsApi;
