import { API_BASE_URL } from "@/app/config/env.config";
import { VpsHttpClient } from "@/core/base/http-client";
import { AI_ENDPOINTS } from "./path";
import type {
  GenerateProductDescriptionRequest,
  GenerateProductDescriptionResponse,
  GenerateProductMetaRequest,
  GenerateProductMetaResponse,
  GenerateChatResponseRequest,
  GenerateChatResponseResponse,
  GenerateProductComparisonRequest,
  GenerateProductComparisonResponse,
  VisualSearchRequest,
  VisualSearchResponse,
  ApiSuccess,
} from "./type";

class AiAssistantApi extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  async generateProductDescription(
    payload: GenerateProductDescriptionRequest
  ): Promise<ApiSuccess<GenerateProductDescriptionResponse>> {
    const response = await this.post(AI_ENDPOINTS.GENERATE_PRODUCT_DESCRIPTION, payload);
    return response.data;
  }

  async generateProductMeta(
    payload: GenerateProductMetaRequest
  ): Promise<ApiSuccess<GenerateProductMetaResponse>> {
    const response = await this.post(AI_ENDPOINTS.GENERATE_PRODUCT_META, payload);
    return response.data;
  }

  async generateChatResponse(
    payload: GenerateChatResponseRequest
  ): Promise<ApiSuccess<GenerateChatResponseResponse>> {
    const response = await this.post(AI_ENDPOINTS.GENERATE_CHAT_RESPONSE, payload);
    return response.data;
  }

  async generateProductComparison(
    payload: GenerateProductComparisonRequest
  ): Promise<ApiSuccess<GenerateProductComparisonResponse>> {
    const response = await this.post(AI_ENDPOINTS.GENERATE_PRODUCT_COMPARISON, payload);
    return response.data;
  }

  async visualSearch(
    payload: VisualSearchRequest
  ): Promise<ApiSuccess<VisualSearchResponse>> {
    const response = await this.post(AI_ENDPOINTS.VISUAL_SEARCH, payload);
    return response.data;
  }
}

export const aiAssistantApi = new AiAssistantApi();

export default aiAssistantApi;

