import { USER_PRODUCT_ATTRIBUTES_ENDPOINTS, buildEndpoint } from "./path";
import type {
  ProductAttribute,
  ProductAttributeListQuery,
  ProductAttributeListResponse,
  ApiSuccess,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Product Attributes API service for users
class UserProductAttributesApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get product attributes list
  async getProductAttributes(
    query?: ProductAttributeListQuery
  ): Promise<ApiSuccess<ProductAttributeListResponse>> {
    const response = await this.get(USER_PRODUCT_ATTRIBUTES_ENDPOINTS.LIST, { params: query });
    return response.data;
  }

  // Get product attribute detail
  async getProductAttribute(id: string): Promise<ApiSuccess<ProductAttribute>> {
    const endpoint = buildEndpoint(USER_PRODUCT_ATTRIBUTES_ENDPOINTS.DETAIL, { id });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Get product attributes by product ID
  async getProductAttributesByProduct(
    productId: string
  ): Promise<ApiSuccess<ProductAttribute[]>> {
    const endpoint = buildEndpoint(USER_PRODUCT_ATTRIBUTES_ENDPOINTS.BY_PRODUCT, {
      productId,
    });
    const response = await this.get(endpoint);
    return response.data;
  }
}

// Export singleton instance
export const userProductAttributesApi = new UserProductAttributesApiService();

// Export default
export default userProductAttributesApi;

