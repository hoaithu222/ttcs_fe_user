import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

const selectChatState = (state: RootState) => (state as any).chat;

export const selectConversations = createSelector(
  [selectChatState],
  (chatState) => chatState?.conversations || []
);

export const selectCurrentConversation = createSelector(
  [selectChatState],
  (chatState) => chatState?.currentConversation || null
);

export const selectChatMessages = (conversationId: string) =>
  createSelector([selectChatState], (chatState) => {
    return chatState?.messages?.[conversationId] || [];
  });

export const selectChatPagination = createSelector(
  [selectChatState],
  (chatState) => chatState?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  }
);

export const selectChatStatus = createSelector(
  [selectChatState],
  (chatState) => chatState?.status || "INIT"
);

export const selectChatError = createSelector(
  [selectChatState],
  (chatState) => chatState?.error || null
);

export const selectUnreadConversations = createSelector(
  [selectConversations],
  (conversations) => conversations.filter((c: any) => (c.unreadCount || 0) > 0)
);

export const selectTotalUnreadCount = createSelector(
  [selectConversations],
  (conversations) =>
    conversations.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0)
);

