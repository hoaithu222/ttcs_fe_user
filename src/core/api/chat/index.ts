import { CHAT_ENDPOINTS, buildEndpoint } from "./path";
import type {
  ChatConversation,
  ChatMessage,
  ConversationListQuery,
  ConversationListResponse,
  MessageListQuery,
  MessageListResponse,
  SendMessageRequest,
  ApiSuccess,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Chat API service for users
class ChatApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get conversations list
  async getConversations(
    query?: ConversationListQuery
  ): Promise<ApiSuccess<ConversationListResponse>> {
    const response = await this.get(CHAT_ENDPOINTS.CONVERSATIONS, { params: query });
    return response.data;
  }

  // Get conversation detail
  async getConversation(id: string): Promise<ApiSuccess<ChatConversation>> {
    const endpoint = buildEndpoint(CHAT_ENDPOINTS.CONVERSATION_DETAIL, { id });
    const response = await this.get(endpoint);
    return response.data;
  }

  // Get messages in a conversation
  async getMessages(
    conversationId: string,
    query?: MessageListQuery
  ): Promise<ApiSuccess<MessageListResponse>> {
    const endpoint = buildEndpoint(CHAT_ENDPOINTS.MESSAGES, { id: conversationId });
    const response = await this.get(endpoint, { params: query });
    return response.data;
  }

  // Send a message
  async sendMessage(
    conversationId: string,
    data: SendMessageRequest
  ): Promise<ApiSuccess<ChatMessage>> {
    const endpoint = buildEndpoint(CHAT_ENDPOINTS.SEND_MESSAGE, { id: conversationId });
    const response = await this.post(endpoint, data);
    return response.data;
  }

  // Mark conversation as read
  async markAsRead(conversationId: string): Promise<ApiSuccess<void>> {
    const endpoint = buildEndpoint(CHAT_ENDPOINTS.MARK_AS_READ, { id: conversationId });
    const response = await this.patch(endpoint);
    return response.data;
  }

  // Mark conversation as delivered
  async markAsDelivered(conversationId: string): Promise<ApiSuccess<void>> {
    const endpoint = buildEndpoint(CHAT_ENDPOINTS.MARK_AS_DELIVERED, { id: conversationId });
    const response = await this.patch(endpoint);
    return response.data;
  }
}

// Export singleton instance
export const chatApi = new ChatApiService();

// Export default
export default chatApi;

