import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxStateType } from "@/app/store/types";
import {
  ChatConversation,
  ChatMessage,
  ConversationListResponse,
  MessageListResponse,
} from "@/core/api/chat/type";
import { ChatState } from "./chat.type";

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  messagesPagination: {},
  lastQuery: undefined,
  status: ReduxStateType.INIT,
  error: null,
  message: null,
  getConversations: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  getMessages: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  sendMessage: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  markAsRead: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Get Conversations
    getConversationsStart: (state, _action: PayloadAction<{ query?: any }>) => {
      state.getConversations.status = ReduxStateType.LOADING;
      state.getConversations.error = null;
      state.getConversations.message = null;
      if (_action.payload.query) {
        state.lastQuery = _action.payload.query;
      }
    },
    getConversationsSuccess: (
      state,
      action: PayloadAction<ConversationListResponse>
    ) => {
      state.getConversations.status = ReduxStateType.SUCCESS;
      state.conversations = action.payload.conversations;
      state.pagination = action.payload.pagination;
      state.getConversations.error = null;
      state.getConversations.message = null;
    },
    getConversationsFailure: (state, action: PayloadAction<string>) => {
      state.getConversations.status = ReduxStateType.ERROR;
      state.getConversations.error = action.payload;
      state.getConversations.message = action.payload;
      state.conversations = [];
    },

    // Set Current Conversation
    setCurrentConversation: (
      state,
      action: PayloadAction<ChatConversation | null>
    ) => {
      state.currentConversation = action.payload;
    },

    // Get Messages
    getMessagesStart: (
      state,
      _action: PayloadAction<{ conversationId: string; query?: any }>
    ) => {
      state.getMessages.status = ReduxStateType.LOADING;
      state.getMessages.error = null;
      state.getMessages.message = null;
    },
    getMessagesSuccess: (
      state,
      action: PayloadAction<{
        conversationId: string;
        response: MessageListResponse;
      }>
    ) => {
      state.getMessages.status = ReduxStateType.SUCCESS;
      const { conversationId, response } = action.payload;
      state.messages[conversationId] = response.messages;
      state.messagesPagination[conversationId] = response.pagination;
      state.getMessages.error = null;
      state.getMessages.message = null;
    },
    getMessagesFailure: (state, action: PayloadAction<string>) => {
      state.getMessages.status = ReduxStateType.ERROR;
      state.getMessages.error = action.payload;
      state.getMessages.message = action.payload;
    },

    // Update Message from Socket
    updateMessageFromSocket: (
      state,
      action: PayloadAction<{
        conversationId: string;
        message: ChatMessage;
      }>
    ) => {
      const { conversationId, message } = action.payload;

      // Update messages in conversation
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      const existingIndex = state.messages[conversationId].findIndex(
        (m) => m._id === message._id
      );

      if (existingIndex === -1) {
        // Add new message
        state.messages[conversationId].push(message);
      } else {
        // Update existing message
        state.messages[conversationId][existingIndex] = message;
      }

      // Update conversation's last message
      const conversationIndex = state.conversations.findIndex(
        (c) => c._id === conversationId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message;
        state.conversations[conversationIndex].updatedAt = message.createdAt;
      }

      // Update current conversation if it matches
      if (state.currentConversation?._id === conversationId) {
        state.currentConversation.lastMessage = message;
        state.currentConversation.updatedAt = message.createdAt;
      }
    },

    // Send Message
    sendMessageStart: (
      state,
      _action: PayloadAction<{ conversationId: string; data: any }>
    ) => {
      state.sendMessage.status = ReduxStateType.LOADING;
      state.sendMessage.error = null;
      state.sendMessage.message = null;
    },
    sendMessageSuccess: (
      state,
      action: PayloadAction<{ conversationId: string; message: ChatMessage }>
    ) => {
      state.sendMessage.status = ReduxStateType.SUCCESS;
      const { conversationId, message } = action.payload;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);

      // Update conversation's last message
      const conversationIndex = state.conversations.findIndex(
        (c) => c._id === conversationId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message;
        state.conversations[conversationIndex].updatedAt = message.createdAt;
      }

      state.sendMessage.error = null;
      state.sendMessage.message = null;
    },
    sendMessageFailure: (state, action: PayloadAction<string>) => {
      state.sendMessage.status = ReduxStateType.ERROR;
      state.sendMessage.error = action.payload;
      state.sendMessage.message = action.payload;
    },

    // Mark as Read
    markAsReadStart: (
      state,
      _action: PayloadAction<{ conversationId: string }>
    ) => {
      state.markAsRead.status = ReduxStateType.LOADING;
      state.markAsRead.error = null;
      state.markAsRead.message = null;
    },
    markAsReadSuccess: (
      state,
      action: PayloadAction<{ conversationId: string }>
    ) => {
      state.markAsRead.status = ReduxStateType.SUCCESS;
      const { conversationId } = action.payload;

      // Update conversation unread count
      const conversationIndex = state.conversations.findIndex(
        (c) => c._id === conversationId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].unreadCount = 0;
      }

      // Update current conversation
      if (state.currentConversation?._id === conversationId) {
        state.currentConversation.unreadCount = 0;
      }

      // Mark all messages as read
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].map(
          (m) => ({ ...m, isRead: true })
        );
      }

      state.markAsRead.error = null;
      state.markAsRead.message = null;
    },
    markAsReadFailure: (state, action: PayloadAction<string>) => {
      state.markAsRead.status = ReduxStateType.ERROR;
      state.markAsRead.error = action.payload;
      state.markAsRead.message = action.payload;
    },

    // Reset state
    resetChatState: () => initialState,
  },
});

export const {
  getConversationsStart,
  getConversationsSuccess,
  getConversationsFailure,
  setCurrentConversation,
  getMessagesStart,
  getMessagesSuccess,
  getMessagesFailure,
  updateMessageFromSocket,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  markAsReadStart,
  markAsReadSuccess,
  markAsReadFailure,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;

