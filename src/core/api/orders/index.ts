import { USER_ORDERS_ENDPOINTS, buildEndpoint } from "./path";
import type {
  Order,
  CreateOrderRequest,
  OrderListQuery,
  OrderListResponse,
  OrderDetailResponse,
  OrderTrackResponse,
  ApiSuccess,
} from "./type";
import { UserHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Orders API service for users
class UserOrdersApiService extends UserHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get user orders list
  async getOrders(query?: OrderListQuery): Promise<ApiSuccess<OrderListResponse>> {
    const response = await this.get(USER_ORDERS_ENDPOINTS.LIST, { params: query });
    return response.data;
  }

  // Get order detail
  async getOrder(id: string): Promise<ApiSuccess<OrderDetailResponse>> {
    const endpoint = buildEndpoint(USER_ORDERS_ENDPOINTS.DETAIL, { id });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Create new order
  async createOrder(data: CreateOrderRequest): Promise<ApiSuccess<Order>> {
    const response = await this.post(USER_ORDERS_ENDPOINTS.CREATE, data);
    return response.data;
  }

  // Cancel order
  async cancelOrder(id: string, reason?: string): Promise<ApiSuccess<Order>> {
    const endpoint = buildEndpoint(USER_ORDERS_ENDPOINTS.CANCEL, { id });
    const response = await this.post(endpoint, { reason });
    return response.data;
  }

  // Track order
  async trackOrder(id: string): Promise<ApiSuccess<OrderTrackResponse>> {
    const endpoint = buildEndpoint(USER_ORDERS_ENDPOINTS.TRACK, { id });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Reorder items from previous order
  async reorder(id: string): Promise<ApiSuccess<void>> {
    const endpoint = buildEndpoint(USER_ORDERS_ENDPOINTS.REORDER, { id });
    const response = await this.post(endpoint);
    return response.data;
  }

  // Get order statistics for user
  async getOrderStats(): Promise<
    ApiSuccess<{
      totalOrders: number;
      pendingOrders: number;
      completedOrders: number;
      cancelledOrders: number;
      totalSpent: number;
    }>
  > {
    const response = await this.get(`${USER_ORDERS_ENDPOINTS.LIST}/stats`);
    return response.data;
  }
}

// Export singleton instance
export const userOrdersApi = new UserOrdersApiService();

// Export default
export default userOrdersApi;
