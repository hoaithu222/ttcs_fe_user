import { IMAGES_ENDPOINTS, buildEndpoint } from "./path";
import type {
  Image,
  CreateImageRequest,
  UpdateImageRequest,
  ImageListQuery,
  ImageListResponse,
  UploadResponse,
  ApiSuccess,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Images API service
class ImagesApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get images list
  async getImages(query?: ImageListQuery): Promise<ApiSuccess<ImageListResponse>> {
    const response = await this.get(IMAGES_ENDPOINTS.LIST, { params: query });
    return response.data;
  }

  // Get image detail
  async getImage(id: string): Promise<ApiSuccess<Image>> {
    const endpoint = buildEndpoint(IMAGES_ENDPOINTS.DETAIL, { id });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Create image record
  async createImage(data: CreateImageRequest): Promise<ApiSuccess<Image>> {
    const response = await this.post(IMAGES_ENDPOINTS.CREATE, data);
    return response.data;
  }

  // Upload image file
  async uploadImage(file: File, metadata?: Partial<CreateImageRequest>): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
    }

    const response = await this.post(IMAGES_ENDPOINTS.UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // Backend returns { success, data: { url, publicId, ... } }
    // Extract data from wrapped response
    return response.data.data;
  }

  // Update image
  async updateImage(id: string, data: UpdateImageRequest): Promise<ApiSuccess<Image>> {
    const endpoint = buildEndpoint(IMAGES_ENDPOINTS.UPDATE, { id });
    const response = await this.put(endpoint, data);
    return response.data;
  }

  // Delete image
  async deleteImage(id: string): Promise<ApiSuccess<void>> {
    const endpoint = buildEndpoint(IMAGES_ENDPOINTS.DELETE, { id });
    const response = await this.delete(endpoint);
    return response.data;
  }
}

// Export singleton instance
export const imagesApi = new ImagesApiService();

// Export default
export default imagesApi;
