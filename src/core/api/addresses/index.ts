import { USER_ADDRESSES_ENDPOINTS, buildEndpoint } from "./path";
import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressListResponse,
  ApiSuccess,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Addresses API service for users
class UserAddressesApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get addresses list
  async getAddresses(): Promise<ApiSuccess<AddressListResponse>> {
    const response = await this.get(USER_ADDRESSES_ENDPOINTS.LIST);
    return response.data;
  }

  // Get address detail
  async getAddress(id: string): Promise<ApiSuccess<Address>> {
    const endpoint = buildEndpoint(USER_ADDRESSES_ENDPOINTS.DETAIL, { id });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Create new address
  async createAddress(data: CreateAddressRequest): Promise<ApiSuccess<Address>> {
    const response = await this.post(USER_ADDRESSES_ENDPOINTS.CREATE, data);
    return response.data;
  }

  // Update address
  async updateAddress(id: string, data: UpdateAddressRequest): Promise<ApiSuccess<Address>> {
    const endpoint = buildEndpoint(USER_ADDRESSES_ENDPOINTS.UPDATE, { id });
    const response = await this.put(endpoint, data);
    return response.data;
  }

  // Delete address
  async deleteAddress(id: string): Promise<ApiSuccess<void>> {
    const endpoint = buildEndpoint(USER_ADDRESSES_ENDPOINTS.DELETE, { id });
    const response = await this.delete(endpoint);
    return response.data;
  }

  // Set address as default
  async setDefaultAddress(id: string): Promise<ApiSuccess<Address>> {
    const endpoint = buildEndpoint(USER_ADDRESSES_ENDPOINTS.SET_DEFAULT, { id });
    const response = await this.post(endpoint);
    return response.data;
  }
}

// Export singleton instance
export const userAddressesApi = new UserAddressesApiService();

// Export default
export default userAddressesApi;
