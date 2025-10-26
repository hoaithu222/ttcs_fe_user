import { SHOP_MANAGEMENT_ENDPOINTS, buildEndpoint } from "./path";
import type {
  ShopInfo,
  ShopProduct,
  ShopOrder,
  CreateShopRequest,
  UpdateShopRequest,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateOrderStatusRequest,
  ShopProductsQuery,
  ShopOrdersQuery,
  ShopProductsResponse,
  ShopOrdersResponse,
  ApiSuccess,
} from "./type";
import { UserHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Shop Management API service
class ShopManagementApiService extends UserHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get shop info
  async getShopInfo(): Promise<ApiSuccess<ShopInfo>> {
    const response = await this.get(SHOP_MANAGEMENT_ENDPOINTS.SHOP_INFO);
    return response.data;
  }

  // Update shop info
  async updateShop(data: UpdateShopRequest): Promise<ApiSuccess<ShopInfo>> {
    const response = await this.put(SHOP_MANAGEMENT_ENDPOINTS.UPDATE_SHOP, data);
    return response.data;
  }

  // Create shop
  async createShop(data: CreateShopRequest): Promise<ApiSuccess<ShopInfo>> {
    const response = await this.post(SHOP_MANAGEMENT_ENDPOINTS.CREATE_SHOP, data);
    return response.data;
  }

  // Get shop products
  async getProducts(query?: ShopProductsQuery): Promise<ApiSuccess<ShopProductsResponse>> {
    const response = await this.get(SHOP_MANAGEMENT_ENDPOINTS.PRODUCTS, { params: query });
    return response.data;
  }

  // Create product
  async createProduct(data: CreateProductRequest): Promise<ApiSuccess<ShopProduct>> {
    const response = await this.post(SHOP_MANAGEMENT_ENDPOINTS.CREATE_PRODUCT, data);
    return response.data;
  }

  // Update product
  async updateProduct(
    productId: string,
    data: UpdateProductRequest
  ): Promise<ApiSuccess<ShopProduct>> {
    const endpoint = buildEndpoint(SHOP_MANAGEMENT_ENDPOINTS.UPDATE_PRODUCT, { productId });
    const response = await this.put(endpoint, data);
    return response.data;
  }

  // Delete product
  async deleteProduct(productId: string): Promise<ApiSuccess<void>> {
    const endpoint = buildEndpoint(SHOP_MANAGEMENT_ENDPOINTS.DELETE_PRODUCT, { productId });
    const response = await this.delete(endpoint);
    return response.data;
  }

  // Get shop orders
  async getOrders(query?: ShopOrdersQuery): Promise<ApiSuccess<ShopOrdersResponse>> {
    const response = await this.get(SHOP_MANAGEMENT_ENDPOINTS.ORDERS, { params: query });
    return response.data;
  }

  // Get order detail
  async getOrder(orderId: string): Promise<ApiSuccess<ShopOrder>> {
    const endpoint = buildEndpoint(SHOP_MANAGEMENT_ENDPOINTS.ORDER_DETAIL, { orderId });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Update order status
  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<ApiSuccess<ShopOrder>> {
    const endpoint = buildEndpoint(SHOP_MANAGEMENT_ENDPOINTS.UPDATE_ORDER_STATUS, { orderId });
    const response = await this.put(endpoint, data);
    return response.data;
  }

  // Get shop followers
  async getFollowers(query?: { page?: number; limit?: number }): Promise<ApiSuccess<any>> {
    const response = await this.get(SHOP_MANAGEMENT_ENDPOINTS.FOLLOWERS, { params: query });
    return response.data;
  }

  // Get shop reviews
  async getReviews(query?: { page?: number; limit?: number }): Promise<ApiSuccess<any>> {
    const response = await this.get(SHOP_MANAGEMENT_ENDPOINTS.REVIEWS, { params: query });
    return response.data;
  }

  // Get shop analytics
  async getAnalytics(query?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiSuccess<any>> {
    const response = await this.get(SHOP_MANAGEMENT_ENDPOINTS.ANALYTICS, { params: query });
    return response.data;
  }
}

// Export singleton instance
export const shopManagementApi = new ShopManagementApiService();

// Export default
export default shopManagementApi;
