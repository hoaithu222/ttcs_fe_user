/**
 * Product Service
 *
 * Service layer để handle tất cả API calls liên quan đến products
 */

import { userProductsApi } from "@/core/api/products";
import type {
  Product,
  ProductListQuery,
  ProductSearchQuery,
  ProductListResponse,
  ProductDetailResponse,
  ProductReview,
  ApiSuccess,
} from "@/core/api/products/type";
export class ProductService {
  /**
   * Lấy danh sách sản phẩm
   */
  static async getProducts(query?: ProductListQuery): Promise<ApiSuccess<ProductListResponse>> {
    try {
      const response = await userProductsApi.getProducts(query);
      const data = (response as any)?.data || response;
      const meta = (response as any)?.meta || {};

      // Handle response structure
      const products = data?.products || (Array.isArray(data) ? data : []);
      const pagination = data?.pagination || meta.pagination || meta || {};

      return {
        success: true,
        data: {
          products: Array.isArray(products) ? products : [],
          pagination: {
            page: pagination.page || query?.page || 1,
            limit: pagination.limit || query?.limit || 20,
            total: pagination.total || 0,
            totalPages: pagination.totalPages || 0,
          },
          filters: data?.filters,
        },
        meta: pagination,
      } as ApiSuccess<ProductListResponse>;
    } catch (error) {
      throw ProductService.handleError(error, "Failed to load products");
    }
  }

  /**
   * Lấy chi tiết sản phẩm
   */
  static async getProduct(productId: string): Promise<ApiSuccess<ProductDetailResponse>> {
    try {
      const response = await userProductsApi.getProduct(productId);
      const data = (response as any)?.data || response;

      return {
        success: true,
        data: {
          product: data?.product || data,
          relatedProducts: data?.relatedProducts || [],
          reviews: data?.reviews || {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: {},
            recentReviews: [],
          },
        },
      } as ApiSuccess<ProductDetailResponse>;
    } catch (error) {
      throw ProductService.handleError(error, "Failed to load product");
    }
  }

  /**
   * Tìm kiếm sản phẩm
   */
  static async searchProducts(query: ProductSearchQuery): Promise<ApiSuccess<ProductListResponse>> {
    try {
      const response = await userProductsApi.searchProducts(query);
      const data = (response as any)?.data || response;
      const meta = (response as any)?.meta || {};

      const products = data?.products || (Array.isArray(data) ? data : []);
      const pagination = data?.pagination || meta.pagination || meta || {};

      return {
        success: true,
        data: {
          products: Array.isArray(products) ? products : [],
          pagination: {
            page: pagination.page || query?.page || 1,
            limit: pagination.limit || query?.limit || 20,
            total: pagination.total || 0,
            totalPages: pagination.totalPages || 0,
          },
          filters: data?.filters,
        },
        meta: pagination,
      } as ApiSuccess<ProductListResponse>;
    } catch (error) {
      throw ProductService.handleError(error, "Failed to search products");
    }
  }

  /**
   * Lấy sản phẩm liên quan
   */
  static async getRelatedProducts(productId: string, limit = 8): Promise<ApiSuccess<Product[]>> {
    try {
      const response = await userProductsApi.getRelatedProducts(productId, { limit });
      const data = (response as any)?.data || response;
      const products = Array.isArray(data) ? data : data?.products || [];

      return {
        success: true,
        data: products,
      } as ApiSuccess<Product[]>;
    } catch (error) {
      throw ProductService.handleError(error, "Failed to load related products");
    }
  }

  /**
   * Lấy reviews của sản phẩm
   */
  static async getProductReviews(
    productId: string,
    page = 1,
    limit = 10
  ): Promise<ApiSuccess<{ reviews: ProductReview[]; pagination: any }>> {
    try {
      const response = await userProductsApi.getProductReviews(productId, { page, limit });
      const data = (response as any)?.data || response;
      const meta = (response as any)?.meta || {};

      return {
        success: true,
        data: {
          reviews: data?.reviews || (Array.isArray(data) ? data : []),
          pagination: data?.pagination ||
            meta.pagination ||
            meta || {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
        },
      } as ApiSuccess<{ reviews: ProductReview[]; pagination: any }>;
    } catch (error) {
      throw ProductService.handleError(error, "Failed to load product reviews");
    }
  }

  /**
   * Track product view
   */
  static async trackProductView(productId: string): Promise<ApiSuccess<void>> {
    try {
      return await userProductsApi.trackProductView(productId);
    } catch (error) {
      // Don't throw error for tracking, just log it
      console.error("Failed to track product view:", error);
      return { success: false } as ApiSuccess<void>;
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
