/**
 * Product Service
 *
 * Service layer để handle tất cả API calls liên quan đến products
 * Tách biệt logic API khỏi saga để dễ test và maintain
 */

import { shopManagementApi } from "@/core/api/shop-management";
import type {
  ShopProduct,
  CreateProductRequest,
  UpdateProductRequest,
  ShopProductsQuery,
} from "@/core/api/shop-management/type";
import type { ApiSuccess } from "@/core/api/shop-management/type";

export class ProductService {
  /**
   * Lấy danh sách sản phẩm
   */
  static async getProducts(query?: ShopProductsQuery): Promise<ApiSuccess<ShopProduct[]>> {
    try {
      const response = await shopManagementApi.getProducts(query);
      const data = (response as any)?.data || response;
      const meta = (response as any)?.meta || {};

      // Handle both array response and object with products property
      const products = Array.isArray(data) ? data : (data as any)?.products || [];

      return {
        success: true,
        data: products,
        meta: {
          page: meta.page || query?.page || 1,
          limit: meta.limit || query?.limit || 10,
          total: meta.total || 0,
          totalPages: meta.totalPages || 0,
        },
      } as ApiSuccess<ShopProduct[]>;
    } catch (error) {
      throw this.handleError(error, "Failed to load products");
    }
  }

  /**
   * Lấy chi tiết sản phẩm
   */
  static async getProduct(productId: string): Promise<ApiSuccess<ShopProduct>> {
    try {
      return await shopManagementApi.getProduct(productId);
    } catch (error) {
      throw this.handleError(error, "Failed to load product");
    }
  }

  /**
   * Tạo sản phẩm mới
   */
  static async createProduct(data: CreateProductRequest): Promise<ApiSuccess<ShopProduct>> {
    try {
      return await shopManagementApi.createProduct(data);
    } catch (error) {
      throw this.handleError(error, "Failed to create product");
    }
  }

  /**
   * Cập nhật sản phẩm
   */
  static async updateProduct(
    productId: string,
    data: UpdateProductRequest
  ): Promise<ApiSuccess<ShopProduct>> {
    try {
      return await shopManagementApi.updateProduct(productId, data);
    } catch (error) {
      throw this.handleError(error, "Failed to update product");
    }
  }

  /**
   * Xóa sản phẩm
   */
  static async deleteProduct(productId: string): Promise<ApiSuccess<void>> {
    try {
      return await shopManagementApi.deleteProduct(productId);
    } catch (error) {
      throw this.handleError(error, "Failed to delete product");
    }
  }

  /**
   * Toggle trạng thái sản phẩm (active/inactive)
   */
  static async toggleProductStatus(
    productId: string,
    isActive: boolean
  ): Promise<ApiSuccess<ShopProduct>> {
    try {
      return await shopManagementApi.updateProduct(productId, { isActive } as UpdateProductRequest);
    } catch (error) {
      throw this.handleError(error, "Failed to toggle product status");
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

export default ProductService;
