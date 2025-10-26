import { USER_PRODUCTS_ENDPOINTS, buildEndpoint } from "./path";
import type {
  Product,
  ProductListQuery,
  ProductSearchQuery,
  RelatedProductsQuery,
  ProductListResponse,
  ProductDetailResponse,
  ProductSearchResponse,
  ApiSuccess,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Products API service for users
class UserProductsApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get products list with query parameters
  async getProducts(params?: ProductListQuery): Promise<ApiSuccess<ProductListResponse>> {
    const response = await this.get(USER_PRODUCTS_ENDPOINTS.LIST, { params });
    return response.data;
  }

  // Get product detail with related products and reviews
  async getProduct(id: string): Promise<ApiSuccess<ProductDetailResponse>> {
    const endpoint = buildEndpoint(USER_PRODUCTS_ENDPOINTS.DETAIL, { id });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Search products
  async searchProducts(params: ProductSearchQuery): Promise<ApiSuccess<ProductSearchResponse>> {
    const response = await this.get(USER_PRODUCTS_ENDPOINTS.SEARCH, { params });
    return response.data;
  }

  // Get featured products
  async getFeaturedProducts(
    params?: Omit<ProductListQuery, "featured">
  ): Promise<ApiSuccess<ProductListResponse>> {
    const response = await this.get(USER_PRODUCTS_ENDPOINTS.FEATURED, { params });
    return response.data;
  }

  // Get recommended products for user
  async getRecommendedProducts(
    params?: Omit<ProductListQuery, "recommended">
  ): Promise<ApiSuccess<ProductListResponse>> {
    const response = await this.get(USER_PRODUCTS_ENDPOINTS.RECOMMENDED, { params });
    return response.data;
  }

  // Get related products
  async getRelatedProducts(
    productId: string,
    params?: RelatedProductsQuery
  ): Promise<ApiSuccess<Product[]>> {
    const endpoint = buildEndpoint(USER_PRODUCTS_ENDPOINTS.RELATED, { id: productId });
    const response = await this.get(endpoint, { params });
    return response.data;
  }

  // Get product reviews
  async getProductReviews(
    productId: string,
    params?: { page?: number; limit?: number; sortBy?: string }
  ): Promise<ApiSuccess<any>> {
    const endpoint = buildEndpoint(USER_PRODUCTS_ENDPOINTS.REVIEWS, { id: productId });
    const response = await this.get(endpoint, { params });
    return response.data;
  }

  // Track product view (for analytics)
  async trackProductView(productId: string): Promise<ApiSuccess<void>> {
    const endpoint = buildEndpoint(USER_PRODUCTS_ENDPOINTS.DETAIL, { id: productId });
    const response = await this.post(`${endpoint}/view`);
    return response.data;
  }
}

// Export singleton instance
export const userProductsApi = new UserProductsApiService();

// Export default
export default userProductsApi;
