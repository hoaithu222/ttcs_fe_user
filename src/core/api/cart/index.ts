import { USER_CART_ENDPOINTS, buildEndpoint } from "./path";
import type {
  AddCartItemRequest,
  UpdateCartItemRequest,
  ApplyCouponRequest,
  CartResponse,
  CartSummary,
  ApiSuccess,
} from "./type";
import { UserHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Cart API service for users
class UserCartApiService extends UserHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get current cart
  async getCart(): Promise<ApiSuccess<CartResponse>> {
    const response = await this.get(USER_CART_ENDPOINTS.GET);
    return response.data;
  }

  // Add item to cart
  async addItem(data: AddCartItemRequest): Promise<ApiSuccess<CartResponse>> {
    const response = await this.post(USER_CART_ENDPOINTS.ADD_ITEM, data);
    return response.data;
  }

  // Update cart item quantity
  async updateItem(itemId: string, data: UpdateCartItemRequest): Promise<ApiSuccess<CartResponse>> {
    const endpoint = buildEndpoint(USER_CART_ENDPOINTS.UPDATE_ITEM, { itemId });
    const response = await this.put(endpoint, data);
    return response.data;
  }

  // Remove item from cart
  async removeItem(itemId: string): Promise<ApiSuccess<CartResponse>> {
    const endpoint = buildEndpoint(USER_CART_ENDPOINTS.DELETE_ITEM, { itemId });
    const response = await this.delete(endpoint);
    return response.data;
  }

  // Clear entire cart
  async clearCart(): Promise<ApiSuccess<void>> {
    const response = await this.delete(USER_CART_ENDPOINTS.CLEAR);
    return response.data;
  }

  // Apply coupon to cart
  async applyCoupon(data: ApplyCouponRequest): Promise<ApiSuccess<CartResponse>> {
    const response = await this.post(USER_CART_ENDPOINTS.APPLY_COUPON, data);
    return response.data;
  }

  // Remove coupon from cart
  async removeCoupon(): Promise<ApiSuccess<CartResponse>> {
    const response = await this.delete(USER_CART_ENDPOINTS.REMOVE_COUPON);
    return response.data;
  }

  // Get cart summary (for header/mini cart)
  async getCartSummary(): Promise<ApiSuccess<CartSummary>> {
    const response = await this.get(`${USER_CART_ENDPOINTS.GET}/summary`);
    return response.data;
  }
}

// Export singleton instance
export const userCartApi = new UserCartApiService();

// Export default
export default userCartApi;
