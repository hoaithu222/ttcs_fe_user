import { VpsHttpClient } from "@/core/base/http-client";
import { AI_CHAT_API_URL } from "@/app/config/env.config";

export interface AiChatApiResponse {
  success: boolean;
  message: string;
  data?: {
    id?: string;
    message?: string;
    reply?: string;
    content?: string;
    [key: string]: any;
  };
  code?: number;
}

export interface AiChatRequestPayload {
  message: string;
}

class AiChatApiService extends VpsHttpClient {
  constructor() {
    super(AI_CHAT_API_URL);
  }

  async sendMessage(payload: AiChatRequestPayload): Promise<AiChatApiResponse> {
    const response = await this.post<AiChatApiResponse>("", payload);
    return response.data;
  }
}

export const aiChatApi = new AiChatApiService();

export default aiChatApi;

