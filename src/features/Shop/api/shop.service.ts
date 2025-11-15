/**
 * Shop Service
 *
 * Service layer để handle tất cả API calls liên quan đến shop info
 */

import { shopManagementApi } from "@/core/api/shop-management";
import { userShopsApi } from "@/core/api/shops";
import type {
  ShopInfo,
  CreateShopRequest,
  UpdateShopRequest,
} from "@/core/api/shop-management/type";
import type { Shop } from "@/core/api/shops/type";
import type { ApiSuccess } from "@/core/api/shop-management/type";

export class ShopService {
  /**
   * Lấy thông tin shop của user hiện tại
   */
  static async getShopInfo(): Promise<ApiSuccess<ShopInfo>> {
    try {
      return await shopManagementApi.getShopInfo();
    } catch (error) {
      throw this.handleError(error, "Failed to load shop info");
    }
  }

  /**
   * Lấy shop của user (từ userShopsApi)
   */
  static async getOwnShop(userId: string, page = 1, limit = 1): Promise<ApiSuccess<Shop | null>> {
    try {
      const response = await userShopsApi.getShops({ userId, page, limit } as any);
      const data = (response as any)?.data || response;
      const items = data?.shops || data?.items || [];
      const shop: Shop | null = Array.isArray(items) && items.length ? (items[0] as Shop) : null;
      return {
        success: true,
        data: shop,
      } as ApiSuccess<Shop | null>;
    } catch (error) {
      throw this.handleError(error, "Failed to load shop");
    }
  }

  /**
   * Lấy trạng thái shop của user
   */
  static async getShopStatusByUserId(userId: string): Promise<ApiSuccess<any>> {
    try {
      return await userShopsApi.getShopStatusByUserId(userId);
    } catch (error) {
      throw this.handleError(error, "Failed to load shop status");
    }
  }

  /**
   * Tạo shop mới
   */
  static async createShop(data: CreateShopRequest): Promise<ApiSuccess<ShopInfo>> {
    try {
      return await shopManagementApi.createShop(data);
    } catch (error) {
      throw this.handleError(error, "Failed to create shop");
    }
  }

  /**
   * Cập nhật thông tin shop
   */
  static async updateShop(data: UpdateShopRequest): Promise<ApiSuccess<ShopInfo>> {
    try {
      return await shopManagementApi.updateShop(data);
    } catch (error) {
      throw this.handleError(error, "Failed to update shop");
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

export default ShopService;
