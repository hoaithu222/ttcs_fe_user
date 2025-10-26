import { USER_WISHLIST_ENDPOINTS, buildEndpoint } from "./path";
import type { WishlistResponse, WishlistCheckResponse, ApiSuccess } from "./type";
import { UserHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Wishlist API service for users
class UserWishlistApiService extends UserHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get wishlist
  async getWishlist(): Promise<ApiSuccess<WishlistResponse>> {
    const response = await this.get(USER_WISHLIST_ENDPOINTS.LIST);
    return response.data;
  }

  // Add product to wishlist
  async addToWishlist(productId: string): Promise<ApiSuccess<WishlistResponse>> {
    const endpoint = buildEndpoint(USER_WISHLIST_ENDPOINTS.ADD_ITEM, { productId });
    const response = await this.post(endpoint);
    return response.data;
  }

  // Remove product from wishlist
  async removeFromWishlist(productId: string): Promise<ApiSuccess<WishlistResponse>> {
    const endpoint = buildEndpoint(USER_WISHLIST_ENDPOINTS.REMOVE_ITEM, { productId });
    const response = await this.delete(endpoint);
    return response.data;
  }

  // Clear entire wishlist
  async clearWishlist(): Promise<ApiSuccess<void>> {
    const response = await this.delete(USER_WISHLIST_ENDPOINTS.CLEAR);
    return response.data;
  }

  // Check if product is in wishlist
  async checkWishlist(productId: string): Promise<ApiSuccess<WishlistCheckResponse>> {
    const endpoint = buildEndpoint(USER_WISHLIST_ENDPOINTS.CHECK, { productId });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Toggle wishlist item (add if not exists, remove if exists)
  async toggleWishlist(productId: string): Promise<ApiSuccess<WishlistResponse>> {
    const checkResponse = await this.checkWishlist(productId);
    const isInWishlist = checkResponse.data?.isInWishlist;

    if (isInWishlist) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }
}

// Export singleton instance
export const userWishlistApi = new UserWishlistApiService();

// Export default
export default userWishlistApi;
