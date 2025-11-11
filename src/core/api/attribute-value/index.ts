import { USER_ATTRIBUTE_VALUES_ENDPOINTS, buildEndpoint } from "./path";
import type {
  AttributeValue,
  AttributeValueListQuery,
  AttributeValueListResponse,
  ApiSuccess,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Attribute Values API service for users
class UserAttributeValuesApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get attribute values list
  async getAttributeValues(
    query?: AttributeValueListQuery
  ): Promise<ApiSuccess<AttributeValueListResponse>> {
    const response = await this.get(USER_ATTRIBUTE_VALUES_ENDPOINTS.LIST, { params: query });
    return response.data;
  }

  // Get attribute value detail
  async getAttributeValue(id: string): Promise<ApiSuccess<AttributeValue>> {
    const endpoint = buildEndpoint(USER_ATTRIBUTE_VALUES_ENDPOINTS.DETAIL, { id });
    const response = await this.get(endpoint);
    return response.data;
  }
}

// Export singleton instance
export const userAttributeValuesApi = new UserAttributeValuesApiService();

// Export default
export default userAttributeValuesApi;

