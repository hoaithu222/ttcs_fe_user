import { USER_REVIEWS_ENDPOINTS, buildEndpoint } from "./path";
import type {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewListQuery,
  ReviewListResponse,
  ReviewStats,
  ApiSuccess,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Reviews API service for users
class UserReviewsApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get product reviews
  async getProductReviews(
    productId: string,
    query?: ReviewListQuery
  ): Promise<ApiSuccess<ReviewListResponse>> {
    const endpoint = buildEndpoint(USER_REVIEWS_ENDPOINTS.PRODUCT_REVIEWS, { productId });
    const response = await this.get(endpoint, { params: query });
    return response.data;
  }

  // Create review for product
  async createReview(productId: string, data: CreateReviewRequest): Promise<ApiSuccess<Review>> {
    const endpoint = buildEndpoint(USER_REVIEWS_ENDPOINTS.CREATE_REVIEW, { productId });
    const response = await this.post(endpoint, data);
    return response.data;
  }

  // Update review
  async updateReview(reviewId: string, data: UpdateReviewRequest): Promise<ApiSuccess<Review>> {
    const endpoint = buildEndpoint(USER_REVIEWS_ENDPOINTS.UPDATE_REVIEW, { reviewId });
    const response = await this.put(endpoint, data);
    return response.data;
  }

  // Delete review
  async deleteReview(reviewId: string): Promise<ApiSuccess<void>> {
    const endpoint = buildEndpoint(USER_REVIEWS_ENDPOINTS.DELETE_REVIEW, { reviewId });
    const response = await this.delete(endpoint);
    return response.data;
  }

  // Get user reviews
  async getUserReviews(query?: ReviewListQuery): Promise<ApiSuccess<ReviewListResponse>> {
    const response = await this.get(USER_REVIEWS_ENDPOINTS.USER_REVIEWS, { params: query });
    return response.data;
  }

  // Mark review as helpful
  async markHelpful(reviewId: string): Promise<ApiSuccess<{ helpfulCount: number }>> {
    const endpoint = buildEndpoint(USER_REVIEWS_ENDPOINTS.HELPFUL, { reviewId });
    const response = await this.post(endpoint);
    return response.data;
  }

  // Get review statistics for product
  async getProductReviewStats(productId: string): Promise<ApiSuccess<ReviewStats>> {
    const endpoint = buildEndpoint(USER_REVIEWS_ENDPOINTS.PRODUCT_REVIEWS, { productId });
    const response = await this.get(`${endpoint}/stats`);
    return response.data;
  }
}

// Export singleton instance
export const userReviewsApi = new UserReviewsApiService();

// Export default
export default userReviewsApi;
