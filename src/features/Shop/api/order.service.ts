/**
 * Order Service
 * 
 * Service layer để handle tất cả API calls liên quan đến orders
 */

import { shopManagementApi } from "@/core/api/shop-management";
import type {
  ShopOrder,
  ShopOrdersQuery,
  UpdateOrderStatusRequest,
} from "@/core/api/shop-management/type";
import type { ApiSuccess } from "@/core/api/shop-management/type";

export class OrderService {
  /**
   * Lấy danh sách đơn hàng
   */
  static async getOrders(query?: ShopOrdersQuery): Promise<ApiSuccess<ShopOrder[]>> {
    try {
      const response = await shopManagementApi.getOrders(query);
      const data = response?.data || response;
      const meta = response?.meta || {};

      // Handle both array response and object with orders property
      const orders = Array.isArray(data) ? data : (data.orders || []);

      return {
        success: true,
        data: orders,
        meta: {
          page: meta.page || query?.page || 1,
          limit: meta.limit || query?.limit || 10,
          total: meta.total || 0,
          totalPages: meta.totalPages || 0,
        },
      } as ApiSuccess<ShopOrder[]>;
    } catch (error) {
      throw this.handleError(error, "Failed to load orders");
    }
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  static async getOrder(orderId: string): Promise<ApiSuccess<ShopOrder>> {
    try {
      return await shopManagementApi.getOrder(orderId);
    } catch (error) {
      throw this.handleError(error, "Failed to load order");
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  static async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<ApiSuccess<ShopOrder>> {
    try {
      return await shopManagementApi.updateOrderStatus(orderId, data);
    } catch (error) {
      throw this.handleError(error, "Failed to update order status");
    }
  }

  /**
   * Handle errors
   */
  private static handleError(error: unknown, fallback: string): Error {
    if (error && typeof error === "object") {
      const e = error as { response?: { data?: { message?: string } }; message?: string };
      return new Error(e?.response?.data?.message || e?.message || fallback);
    }
    return new Error(fallback);
  }
}

export default OrderService;

