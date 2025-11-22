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
      
      // Update conversations while preserving unreadCount for currently viewing conversation
      const newConversations = action.payload.conversations;
      const currentlyViewingId = state.currentConversation?._id;
      
      state.conversations = newConversations.map((newConv) => {
        // If this is the currently viewing conversation, always set unreadCount to 0
        if (currentlyViewingId && newConv._id === currentlyViewingId) {
          return {
            ...newConv,
            unreadCount: 0, // Reset unread count when viewing
          };
        }
        // Otherwise, use unreadCount from backend (already calculated correctly)
        return newConv;
      });
      
      // Also update current conversation's unread count if it exists in the list
      if (currentlyViewingId) {
        const currentInList = state.conversations.find(
          (c) => c._id === currentlyViewingId
        );
        if (currentInList && state.currentConversation) {
          state.currentConversation = {
            ...currentInList,
            unreadCount: 0,
          };
        }
      }
      
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
      const newConversation = action.payload;
      
      // Reset unread count of previous conversation
      if (state.currentConversation?._id) {
        const prevIndex = state.conversations.findIndex(
          (c) => c._id === state.currentConversation?._id
        );
        if (prevIndex !== -1) {
          state.conversations[prevIndex].unreadCount = 0;
        }
      }
      
      // Set new current conversation and reset its unread count
      if (newConversation) {
        state.currentConversation = {
          ...newConversation,
          unreadCount: 0, // Reset unread count when viewing
        };
        
        // Also update in conversations list
        const conversationIndex = state.conversations.findIndex(
          (c) => c._id === newConversation._id
        );
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].unreadCount = 0;
        }
      } else {
        state.currentConversation = null;
      }
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
      // Remove duplicates and sort messages
      const uniqueMessages = Array.from(
        new Map(response.messages.map((msg: any) => [msg._id, msg])).values()
      );
      state.messages[conversationId] = uniqueMessages.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      });
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
        isSender?: boolean;
      }>
    ) => {
      const { conversationId, message, isSender = false } = action.payload;

      // Initialize messages array if needed
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      // Remove ALL temporary messages with same content (optimistic updates)
      // Match by message content and timestamp (within 5 seconds)
      const messageTime = new Date(message.createdAt).getTime();
      const tempMessagesToRemove: number[] = [];
      
      state.messages[conversationId].forEach((m, index) => {
        if (m._id.startsWith("temp-")) {
          const tempTime = new Date(m.createdAt).getTime();
          const timeDiff = Math.abs(messageTime - tempTime);
          // Match if same message content and within 5 seconds
          if (m.message === message.message && timeDiff < 5000) {
            tempMessagesToRemove.push(index);
          }
        }
      });
      
      // Remove temp messages in reverse order to maintain indices
      for (let i = tempMessagesToRemove.length - 1; i >= 0; i--) {
        state.messages[conversationId].splice(tempMessagesToRemove[i], 1);
      }

      // Check if message already exists by _id
      const existingIndex = state.messages[conversationId].findIndex(
        (m) => m._id === message._id
      );

      if (existingIndex === -1) {
        // Check for duplicate by content and timestamp (within 1 second)
        const duplicateIndex = state.messages[conversationId].findIndex((m) => {
          if (m._id === message._id) return true;
          const mTime = new Date(m.createdAt).getTime();
          const timeDiff = Math.abs(messageTime - mTime);
          return m.message === message.message && 
                 m.senderId === message.senderId && 
                 timeDiff < 1000;
        });
        
        if (duplicateIndex === -1) {
          // Add new message at the end (will be sorted by selector)
          state.messages[conversationId].push(message);
        } else {
          // Update existing duplicate message
          state.messages[conversationId][duplicateIndex] = message;
        }
      } else {
        // Update existing message (preserve position)
        state.messages[conversationId][existingIndex] = message;
      }

      // Update conversation's last message
      const conversationIndex = state.conversations.findIndex(
        (c) => c._id === conversationId
      );
      
      const isCurrentlyViewing = state.currentConversation?._id === conversationId;
      
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message;
        state.conversations[conversationIndex].updatedAt = message.createdAt;
        
        // If viewing the conversation, always reset unread count to 0
        // If not viewing and message is from someone else, increment unread count
        if (isCurrentlyViewing) {
          state.conversations[conversationIndex].unreadCount = 0;
        } else if (!isSender) {
          // Only increment if not from current user and not viewing
          // Increment unread count when receiving new message from others
          const currentUnread = state.conversations[conversationIndex].unreadCount || 0;
          state.conversations[conversationIndex].unreadCount = currentUnread + 1;
        }
        // If message is from current user, don't change unread count
      }

      // Update current conversation if it matches
      if (isCurrentlyViewing) {
        state.currentConversation.lastMessage = message;
        state.currentConversation.updatedAt = message.createdAt;
        // Always reset unread count to 0 when viewing conversation
        state.currentConversation.unreadCount = 0;
      }
    },

    // Update Conversation from Socket
    updateConversationFromSocket: (
      state,
      action: PayloadAction<{
        conversation: ChatConversation;
      }>
    ) => {
      const { conversation } = action.payload;
      const conversationIndex = state.conversations.findIndex(
        (c) => c._id === conversation._id
      );

      const isCurrentlyViewing = state.currentConversation?._id === conversation._id;
      
      if (conversationIndex !== -1) {
        // Update existing conversation
        const currentConv = state.conversations[conversationIndex];
        const currentUnreadCount = currentConv.unreadCount || 0;
        const newUnreadCount = conversation.unreadCount || 0;
        
        // If viewing, always reset to 0
        // If not viewing, only update if new count is higher (to prevent reset to 0 when shouldn't)
        // Or if new count is 0 and current is also 0 (both are 0, so it's fine)
        let finalUnreadCount: number;
        if (isCurrentlyViewing) {
          finalUnreadCount = 0;
        } else {
          // Only update unreadCount if:
          // 1. New count is higher than current (new messages arrived)
          // 2. New count equals current (no change, safe to update)
          // 3. Both are 0 (no unread messages, safe to update)
          // Don't update if new count is 0 but current is > 0 (prevent reset when shouldn't)
          if (newUnreadCount >= currentUnreadCount || (newUnreadCount === 0 && currentUnreadCount === 0)) {
            finalUnreadCount = newUnreadCount;
          } else {
            // Keep current unread count to prevent reset
            finalUnreadCount = currentUnreadCount;
          }
        }
        
        state.conversations[conversationIndex] = {
          ...conversation,
          unreadCount: finalUnreadCount,
        };
      } else {
        // Add new conversation at the beginning
        state.conversations.unshift(conversation);
      }

      // Sort conversations by lastMessageAt or updatedAt (newest first)
      state.conversations.sort((a, b) => {
        const dateA = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
        return dateB - dateA;
      });

      // Update current conversation if it matches
      if (isCurrentlyViewing) {
        state.currentConversation = {
          ...conversation,
          unreadCount: 0, // Always reset unread count when viewing
        };
      }
    },

    // Append Messages (for pagination)
    appendMessages: (
      state,
      action: PayloadAction<{
        conversationId: string;
        messages: ChatMessage[];
        pagination: MessageListResponse["pagination"];
      }>
    ) => {
      const { conversationId, messages, pagination } = action.payload;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      // Append messages (avoid duplicates)
      const existingIds = new Set(state.messages[conversationId].map(m => m._id));
      const newMessages = messages.filter(m => !existingIds.has(m._id));
      state.messages[conversationId] = [...newMessages, ...state.messages[conversationId]];
      
      // Update pagination
      state.messagesPagination[conversationId] = pagination;
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

      // Check if message already exists (avoid duplicates from socket)
      const existingIndex = state.messages[conversationId].findIndex(
        (m) => m._id === message._id
      );

      if (existingIndex === -1) {
        // Check for duplicate by content and timestamp
        const messageTime = new Date(message.createdAt).getTime();
        const duplicateIndex = state.messages[conversationId].findIndex((m) => {
          const mTime = new Date(m.createdAt).getTime();
          const timeDiff = Math.abs(messageTime - mTime);
          return m.message === message.message && 
                 m.senderId === message.senderId && 
                 timeDiff < 1000;
        });
        
        if (duplicateIndex === -1) {
          state.messages[conversationId].push(message);
        } else {
          // Update existing duplicate
          state.messages[conversationId][duplicateIndex] = message;
        }
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

      state.sendMessage.error = null;
      state.sendMessage.message = null;
    },
    sendMessageFailure: (state, action: PayloadAction<string>) => {
      state.sendMessage.status = ReduxStateType.ERROR;
      state.sendMessage.error = action.payload;
      state.sendMessage.message = action.payload;
    },

    // Send Message Via Socket (optimistic update)
    sendMessageViaSocket: (
      state,
      action: PayloadAction<{
        conversationId: string;
        message: string;
        type?: "admin" | "shop";
        targetId?: string;
        metadata?: Record<string, any>;
      }>
    ) => {
      const { conversationId, message } = action.payload;
      
      // Create temporary message for optimistic update
      const tempMessage: ChatMessage = {
        _id: `temp-${Date.now()}`,
        conversationId: conversationId === "temp" ? "" : conversationId,
        senderId: "", // Will be updated from socket response
        message,
        isRead: false,
        isDelivered: false,
        createdAt: new Date().toISOString(),
      };

      if (conversationId !== "temp" && !state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      if (conversationId !== "temp") {
        state.messages[conversationId].push(tempMessage);
      }
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

    // Create Conversation
    createConversationStart: (
      state,
      _action: PayloadAction<{ data: any }>
    ) => {
      state.status = ReduxStateType.LOADING;
      state.error = null;
      state.message = null;
    },
    createConversationSuccess: (
      state,
      action: PayloadAction<ChatConversation>
    ) => {
      state.status = ReduxStateType.SUCCESS;
      const conversation = action.payload;

      // Add to conversations list if not exists
      const existingIndex = state.conversations.findIndex(
        (c) => c._id === conversation._id
      );
      if (existingIndex === -1) {
        state.conversations.unshift(conversation);
      } else {
        state.conversations[existingIndex] = conversation;
      }

      // Set as current conversation
      state.currentConversation = conversation;
      state.error = null;
      state.message = null;
    },
    createConversationFailure: (state, action: PayloadAction<string>) => {
      state.status = ReduxStateType.ERROR;
      state.error = action.payload;
      state.message = action.payload;
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
  updateConversationFromSocket,
  appendMessages,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  sendMessageViaSocket,
  markAsReadStart,
  markAsReadSuccess,
  markAsReadFailure,
  createConversationStart,
  createConversationSuccess,
  createConversationFailure,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;

