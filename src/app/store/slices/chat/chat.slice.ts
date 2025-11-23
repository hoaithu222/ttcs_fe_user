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
  typing: {}, // conversationId -> userIds who are typing
  onlineUsers: {}, // conversationId -> userIds who are online
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
      
      // Update conversations while preserving unreadCountMe for currently viewing conversation
      const newConversations = action.payload.conversations;
      const currentlyViewingId = state.currentConversation?._id;
      
      state.conversations = newConversations.map((newConv) => {
        // If this is the currently viewing conversation, always set unreadCountMe to 0
        // Use String() to ensure consistent comparison (handle ObjectId vs string)
        if (currentlyViewingId && String(newConv._id) === String(currentlyViewingId)) {
          return {
            ...newConv,
            unreadCountMe: 0, // Reset unread count when viewing
            unreadCount: 0, // Backward compatibility
            // Keep unreadCountTo from backend (messages from me that others haven't read)
            unreadCountTo: typeof newConv.unreadCountTo === 'number' ? newConv.unreadCountTo : 0,
          };
        }
        // Otherwise, use unreadCountMe and unreadCountTo from backend (already calculated correctly)
        return {
          ...newConv,
          // Ensure unreadCountMe is a number, default to 0 if not provided
          unreadCountMe: typeof newConv.unreadCountMe === 'number' ? newConv.unreadCountMe : 0,
          unreadCountTo: typeof newConv.unreadCountTo === 'number' ? newConv.unreadCountTo : 0,
          unreadCount: typeof newConv.unreadCountMe === 'number' ? newConv.unreadCountMe : 0,
        };
      });
      
      // Also update current conversation's unread count if it exists in the list
      if (currentlyViewingId) {
        const currentInList = state.conversations.find(
          (c) => c._id === currentlyViewingId
        );
        if (currentInList && state.currentConversation) {
          state.currentConversation = {
            ...currentInList,
            unreadCountMe: 0,
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
      
      // DON'T reset unread count of previous conversation when switching
      // The previous conversation's unread count should remain until user actually reads it
      
      // Set new current conversation and reset its unread count
      if (newConversation) {
        // Find conversation in list to get latest data
        // Use String() to ensure consistent comparison (handle ObjectId vs string)
        const conversationIndex = state.conversations.findIndex(
          (c) => String(c._id) === String(newConversation._id)
        );
        
        // Use conversation from list if exists, otherwise use the one passed in
        const conversationToSet = conversationIndex !== -1 
          ? state.conversations[conversationIndex]
          : newConversation;
        
        // Set current conversation with unreadCountMe = 0 (user is viewing it)
        state.currentConversation = {
          ...conversationToSet,
          unreadCountMe: 0, // Reset unread count when viewing
          unreadCount: 0, // Backward compatibility
        };
        
        // Also update in conversations list - set unreadCountMe to 0 for the one being viewed
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex] = {
            ...state.conversations[conversationIndex],
            unreadCountMe: 0,
            unreadCount: 0,
            // Keep unreadCountTo from existing conversation
            unreadCountTo: typeof state.conversations[conversationIndex].unreadCountTo === 'number' 
              ? state.conversations[conversationIndex].unreadCountTo 
              : 0,
          };
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
      // Use String() to ensure consistent comparison (handle ObjectId vs string)
      const conversationIndex = state.conversations.findIndex(
        (c) => String(c._id) === String(conversationId)
      );
      
      const isCurrentlyViewing = state.currentConversation?._id 
        ? String(state.currentConversation._id) === String(conversationId)
        : false;
      
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message;
        state.conversations[conversationIndex].updatedAt = message.createdAt;
        
        // Don't manually update unreadCountMe here - wait for backend to send conversation update
        // Backend will send correct unreadCountMe via updateConversationFromSocket
        // Only reset to 0 if currently viewing (user is actively reading)
        if (isCurrentlyViewing) {
          state.conversations[conversationIndex].unreadCountMe = 0;
          state.conversations[conversationIndex].unreadCount = 0;
        }
        // If not viewing and message is from others, backend will send conversation update with correct unreadCountMe
      }

      // Update current conversation if it matches
      if (isCurrentlyViewing && state.currentConversation) {
        state.currentConversation.lastMessage = message;
        state.currentConversation.updatedAt = message.createdAt;
        // Always reset unread count to 0 when viewing conversation
        state.currentConversation.unreadCountMe = 0;
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
      // Use String() to ensure consistent comparison (handle ObjectId vs string)
      const conversationIndex = state.conversations.findIndex(
        (c) => String(c._id) === String(conversation._id)
      );

      // Use String() to ensure consistent comparison (handle ObjectId vs string)
      const isCurrentlyViewing = state.currentConversation?._id 
        ? String(state.currentConversation._id) === String(conversation._id)
        : false;
      
      if (conversationIndex !== -1) {
        // Update existing conversation
        // Backend now sends correct unreadCountMe and unreadCountTo for current user via direct room
        // IMPORTANT: Always use unreadCountMe from backend, never fallback to unreadCount (could be wrong value)
        let finalUnreadCountMe = typeof conversation.unreadCountMe === 'number' 
          ? conversation.unreadCountMe 
          : 0; // If unreadCountMe is not provided, default to 0 (not fallback to unreadCount)
        const finalUnreadCountTo = typeof conversation.unreadCountTo === 'number' 
          ? conversation.unreadCountTo 
          : 0;
        
        // If viewing, always reset unreadCountMe to 0 (user is actively viewing, so no unread)
        if (isCurrentlyViewing) {
          finalUnreadCountMe = 0;
        }
        
        state.conversations[conversationIndex] = {
          ...conversation,
          unreadCountMe: finalUnreadCountMe,
          unreadCountTo: finalUnreadCountTo,
          unreadCount: finalUnreadCountMe, // Backward compatibility - use unreadCountMe, not old unreadCount
        };
      } else {
        // Add new conversation at the beginning
        // IMPORTANT: Always use unreadCountMe from backend, never fallback to unreadCount
        const unreadCountMe = typeof conversation.unreadCountMe === 'number' 
          ? conversation.unreadCountMe 
          : 0; // If unreadCountMe is not provided, default to 0
        const unreadCountTo = typeof conversation.unreadCountTo === 'number' 
          ? conversation.unreadCountTo 
          : 0;
        
        const newConversation = isCurrentlyViewing
          ? { 
              ...conversation, 
              unreadCountMe: 0, 
              unreadCountTo: unreadCountTo, // Keep unreadCountTo even when viewing
              unreadCount: 0 
            }
          : { 
              ...conversation, 
              unreadCountMe: unreadCountMe,
              unreadCountTo: unreadCountTo,
              unreadCount: unreadCountMe // Use unreadCountMe, not old unreadCount
            };
        state.conversations.unshift(newConversation);
      }

      // Sort conversations by lastMessageAt or updatedAt (newest first)
      state.conversations.sort((a, b) => {
        const dateA = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
        return dateB - dateA;
      });

      // Update current conversation if it matches
      if (isCurrentlyViewing) {
        const unreadCountTo = typeof conversation.unreadCountTo === 'number' 
          ? conversation.unreadCountTo 
          : 0;
        state.currentConversation = {
          ...conversation,
          unreadCountMe: 0, // Always reset unread count when viewing
          unreadCountTo: unreadCountTo, // Keep unreadCountTo even when viewing
          unreadCount: 0, // Backward compatibility
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
      // Use String() to ensure consistent comparison (handle ObjectId vs string)
      const conversationIndex = state.conversations.findIndex(
        (c) => String(c._id) === String(conversationId)
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
      // Use String() to ensure consistent comparison (handle ObjectId vs string)
      const conversationIndex = state.conversations.findIndex(
        (c) => String(c._id) === String(conversationId)
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].unreadCountMe = 0;
        state.conversations[conversationIndex].unreadCount = 0;
      }

      // Update current conversation
      const isCurrentlyViewing = state.currentConversation?._id 
        ? String(state.currentConversation._id) === String(conversationId)
        : false;
      if (isCurrentlyViewing) {
        state.currentConversation.unreadCountMe = 0;
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
      // Use String() to ensure consistent comparison (handle ObjectId vs string)
      const existingIndex = state.conversations.findIndex(
        (c) => String(c._id) === String(conversation._id)
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

    // Typing indicators
    setTyping: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>
    ) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typing[conversationId]) {
        state.typing[conversationId] = [];
      }
      if (isTyping) {
        if (!state.typing[conversationId].includes(userId)) {
          state.typing[conversationId].push(userId);
        }
      } else {
        state.typing[conversationId] = state.typing[conversationId].filter(
          (id) => id !== userId
        );
      }
    },
    
    // Online users
    setOnlineUsers: (
      state,
      action: PayloadAction<{ conversationId: string; userIds: string[] }>
    ) => {
      state.onlineUsers[action.payload.conversationId] = action.payload.userIds;
    },
    
    addOnlineUser: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string }>
    ) => {
      const { conversationId, userId } = action.payload;
      if (!state.onlineUsers[conversationId]) {
        state.onlineUsers[conversationId] = [];
      }
      if (!state.onlineUsers[conversationId].includes(userId)) {
        state.onlineUsers[conversationId].push(userId);
      }
    },
    
    removeOnlineUser: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string }>
    ) => {
      const { conversationId, userId } = action.payload;
      if (state.onlineUsers[conversationId]) {
        state.onlineUsers[conversationId] = state.onlineUsers[conversationId].filter(
          (id) => id !== userId
        );
      }
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
  setTyping,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;

