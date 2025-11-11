import { USER_ATTRIBUTE_TYPES_ENDPOINTS, buildEndpoint } from "./path";
import type {
  AttributeType,
  AttributeTypeListQuery,
  AttributeTypeListResponse,
  ApiSuccess,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Attribute Types API service for users
class UserAttributeTypesApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get attribute types list
  async getAttributeTypes(
    query?: AttributeTypeListQuery
  ): Promise<ApiSuccess<AttributeTypeListResponse>> {
    const response = await this.get(USER_ATTRIBUTE_TYPES_ENDPOINTS.LIST, { params: query });
    return response.data;
  }

  // Get attribute type detail
  async getAttributeType(id: string): Promise<ApiSuccess<AttributeType>> {
    const endpoint = buildEndpoint(USER_ATTRIBUTE_TYPES_ENDPOINTS.DETAIL, { id });
    const response = await this.get(endpoint);
    return response.data;
  }
}

// Export singleton instance
export const userAttributeTypesApi = new UserAttributeTypesApiService();

// Export default
export default userAttributeTypesApi;
