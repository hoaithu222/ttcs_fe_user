import { ReduxStateType } from "@/app/store/types";
import { ChatConversation, ChatMessage, ConversationListQuery } from "@/core/api/chat/type";

export interface ChatState {
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  messages: Record<string, ChatMessage[]>; // conversationId -> messages
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  messagesPagination: Record<string, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>; // conversationId -> pagination
  lastQuery?: ConversationListQuery;
  status: ReduxStateType;
  error: string | null;
  message: string | null;
  getConversations: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  getMessages: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  sendMessage: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  markAsRead: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
}

