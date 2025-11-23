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
    const messages = chatState?.messages?.[conversationId] || [];
    
    // Remove duplicates by _id first
    const uniqueById = Array.from(
      new Map(messages.map((msg: any) => [msg._id, msg])).values()
    );
    
    // Remove duplicates by content, senderId, and timestamp (within 1 second)
    const uniqueMessages: any[] = [];
    const seen = new Set<string>();
    
    uniqueById.forEach((msg: any) => {
      const key = `${msg.message}|${msg.senderId}|${new Date(msg.createdAt).getTime()}`;
      const timestamp = new Date(msg.createdAt).getTime();
      
      // Check if we've seen a similar message
      let isDuplicate = false;
      for (const seenKey of seen) {
        const [seenMsg, seenSender, seenTime] = seenKey.split('|');
        const timeDiff = Math.abs(timestamp - parseInt(seenTime));
        if (seenMsg === msg.message && seenSender === msg.senderId && timeDiff < 1000) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        seen.add(key);
        uniqueMessages.push(msg);
      }
    });
    
    // Sort messages by createdAt (oldest first)
    return uniqueMessages.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    });
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
  (conversations) => {
    // Chỉ lấy conversations có unreadCountMe > 0 (số tin nhắn chưa đọc của chính user)
    return conversations.filter((c: any) => {
      const unreadCountMe = typeof c.unreadCountMe === 'number' ? c.unreadCountMe : 0;
      return unreadCountMe > 0;
    });
  }
);

export const selectTotalUnreadCount = createSelector(
  [selectConversations],
  (conversations) => {
    if (!conversations || conversations.length === 0) return 0;
    return conversations.reduce((sum: number, c: any) => {
      // Chỉ lấy unreadCountMe (số tin nhắn chưa đọc của chính user hiện tại)
      // Không fallback về unreadCount vì có thể là số của người khác
      const unreadCountMe = typeof c.unreadCountMe === 'number' ? Math.max(0, c.unreadCountMe) : 0;
      return sum + unreadCountMe;
    }, 0);
  }
);

// Selector to get unread count for a specific conversation from messages
export const selectUnreadCountFromMessages = (conversationId: string, currentUserId?: string) =>
  createSelector([selectChatState], (chatState) => {
    const messages = chatState?.messages?.[conversationId] || [];
    if (!currentUserId) return { myUnread: 0, theirUnread: 0 };
    
    // My unread: messages from others that I haven't read
    const myUnread = messages.filter(
      (msg: any) => msg.senderId !== currentUserId && !msg.isRead
    ).length;
    
    // Their unread: messages I sent that they haven't read
    const theirUnread = messages.filter(
      (msg: any) => msg.senderId === currentUserId && !msg.isRead
    ).length;
    
    return { myUnread, theirUnread };
  });

export const selectTypingUsers = (conversationId: string) =>
  createSelector([selectChatState], (chatState) => {
    return chatState?.typing?.[conversationId] || [];
  });

export const selectOnlineUsers = (conversationId: string) =>
  createSelector([selectChatState], (chatState) => {
    return chatState?.onlineUsers?.[conversationId] || [];
  });

