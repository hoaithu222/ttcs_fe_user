import { USER_SHOPS_ENDPOINTS, buildEndpoint } from "./path";
import type {
  ShopListQuery,
  ShopProductsQuery,
  NearbyShopsQuery,
  ShopListResponse,
  ShopDetailResponse,
  ShopProductsResponse,
  FollowStatusResponse,
  NearbyShopsResponse,
  ApiSuccess,
} from "./type";
import { UserHttpClient } from "@/core/base/http-client";

// Shops API service for users
class UserShopsApiService extends UserHttpClient {
  constructor() {
    super(import.meta.env.VITE_API_BASE_URL || "");
  }

  // Get shops list
  async getShops(query?: ShopListQuery): Promise<ApiSuccess<ShopListResponse>> {
    const response = await this.get(USER_SHOPS_ENDPOINTS.LIST, { params: query });
    return response.data;
  }

  // Get shop detail
  async getShop(id: string): Promise<ApiSuccess<ShopDetailResponse>> {
    const endpoint = buildEndpoint(USER_SHOPS_ENDPOINTS.DETAIL, { id });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Follow shop
  async followShop(id: string): Promise<ApiSuccess<void>> {
    const endpoint = buildEndpoint(USER_SHOPS_ENDPOINTS.FOLLOW, { id });
    const response = await this.post(endpoint);
    return response.data;
  }

  // Unfollow shop
  async unfollowShop(id: string): Promise<ApiSuccess<void>> {
    const endpoint = buildEndpoint(USER_SHOPS_ENDPOINTS.UNFOLLOW, { id });
    const response = await this.delete(endpoint);
    return response.data;
  }

  // Check if following shop
  async getFollowingStatus(id: string): Promise<ApiSuccess<FollowStatusResponse>> {
    const endpoint = buildEndpoint(USER_SHOPS_ENDPOINTS.FOLLOWING, { id });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Get followers count
  async getFollowersCount(id: string): Promise<ApiSuccess<{ count: number }>> {
    const endpoint = buildEndpoint(USER_SHOPS_ENDPOINTS.FOLLOWERS_COUNT, { id });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Get shop products
  async getShopProducts(
    shopId: string,
    query?: ShopProductsQuery
  ): Promise<ApiSuccess<ShopProductsResponse>> {
    const endpoint = buildEndpoint(USER_SHOPS_ENDPOINTS.PRODUCTS, { id: shopId });
    const response = await this.get(endpoint, { params: query });
    return response.data;
  }

  // Get shop reviews
  async getShopReviews(
    shopId: string,
    query?: { page?: number; limit?: number }
  ): Promise<ApiSuccess<any>> {
    const endpoint = buildEndpoint(USER_SHOPS_ENDPOINTS.REVIEWS, { id: shopId });
    const response = await this.get(endpoint, { params: query });
    return response.data;
  }

  // Get featured shops
  async getFeaturedShops(limit?: number): Promise<ApiSuccess<ShopListResponse>> {
    const response = await this.get(USER_SHOPS_ENDPOINTS.FEATURED, {
      params: { limit },
    });
    return response.data;
  }

  // Get nearby shops
  async getNearbyShops(query: NearbyShopsQuery): Promise<ApiSuccess<NearbyShopsResponse>> {
    const response = await this.get(USER_SHOPS_ENDPOINTS.NEARBY, { params: query });
    return response.data;
  }
}

// Export singleton instance
export const userShopsApi = new UserShopsApiService();

// Export default
export default userShopsApi;
