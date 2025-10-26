import { USER_CATEGORIES_ENDPOINTS, buildEndpoint } from "./path";
import type {
  Category,
  CategoryListQuery,
  CategoryListResponse,
  SubCategoryListResponse,
  PopularCategoriesResponse,
  ApiSuccess,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Categories API service for users
class UserCategoriesApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get categories list
  async getCategories(query?: CategoryListQuery): Promise<ApiSuccess<CategoryListResponse>> {
    const response = await this.get(USER_CATEGORIES_ENDPOINTS.LIST, { params: query });
    return response.data;
  }

  // Get category detail
  async getCategory(id: string): Promise<ApiSuccess<Category>> {
    const endpoint = buildEndpoint(USER_CATEGORIES_ENDPOINTS.DETAIL, { id });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Get sub-categories of a category
  async getSubCategories(
    categoryId: string,
    query?: CategoryListQuery
  ): Promise<ApiSuccess<SubCategoryListResponse>> {
    const endpoint = buildEndpoint(USER_CATEGORIES_ENDPOINTS.SUB_CATEGORIES, { id: categoryId });
    const response = await this.get(endpoint, { params: query });
    return response.data;
  }

  // Get popular categories
  async getPopularCategories(limit?: number): Promise<ApiSuccess<PopularCategoriesResponse>> {
    const response = await this.get(USER_CATEGORIES_ENDPOINTS.POPULAR, {
      params: { limit },
    });
    return response.data;
  }
}

// Export singleton instance
export const userCategoriesApi = new UserCategoriesApiService();

// Export default
export default userCategoriesApi;
