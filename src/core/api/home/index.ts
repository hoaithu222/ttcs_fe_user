import { HOME_ENDPOINTS, buildEndpoint } from "./path";
import type {
  HomeBannerResponse,
  HomeCategoriesResponse,
  HomeBestSellerResponse,
  HomeBestShopsResponse,
  HomeFlashSaleResponse,
  HomeSearchSuggestionResponse,
  ApiSuccess,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Home API service for users
class HomeApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get home banner
  async getBanner(): Promise<ApiSuccess<HomeBannerResponse>> {
    const response = await this.get(HOME_ENDPOINTS.BANNER);
    return response.data;
  }

  // Get home categories
  async getHomeCategories(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiSuccess<HomeCategoriesResponse>> {
    const response = await this.get(HOME_ENDPOINTS.CATEGORIES, { params });
    return response.data;
  }

  // Get best seller products
  async getBestSellerProducts(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiSuccess<HomeBestSellerResponse>> {
    const response = await this.get(HOME_ENDPOINTS.BEST_SELLER, { params });
    return response.data;
  }

  // Get best shops
  async getBestShops(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiSuccess<HomeBestShopsResponse>> {
    const response = await this.get(HOME_ENDPOINTS.BEST_SHOPS, { params });
    return response.data;
  }

  // Get flash sale products
  async getFlashSaleProducts(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiSuccess<HomeFlashSaleResponse>> {
    const response = await this.get(HOME_ENDPOINTS.FLASH_SALE, { params });
    return response.data;
  }

  // Get search suggestions
  async getSearchSuggestions(params: {
    q: string;
    page?: number;
    limit?: number;
  }): Promise<ApiSuccess<HomeSearchSuggestionResponse>> {
    const response = await this.get(HOME_ENDPOINTS.SEARCH_SUGGESTION, { params });
    return response.data;
  }
}

// Export singleton instance
export const homeApi = new HomeApiService();

// Export default
export default homeApi;
