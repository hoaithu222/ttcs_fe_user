import { USER_SUB_CATEGORIES_ENDPOINTS, buildEndpoint } from "./path";
import type { SubCategoryListQuery, SubCategoryListResponse } from "./type";
import type { SubCategory, ApiSuccess } from "@/core/api/categories/type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

class UserSubCategoriesApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  async getSubCategories(
    query?: SubCategoryListQuery
  ): Promise<ApiSuccess<SubCategoryListResponse>> {
    const response = await this.get(USER_SUB_CATEGORIES_ENDPOINTS.LIST, { params: query });
    return response.data;
  }

  async getSubCategory(id: string): Promise<ApiSuccess<SubCategory>> {
    const endpoint = buildEndpoint(USER_SUB_CATEGORIES_ENDPOINTS.DETAIL, { id });
    const response = await this.get(endpoint);
    return response.data;
  }
}

export const userSubCategoriesApi = new UserSubCategoriesApiService();

export default userSubCategoriesApi;


