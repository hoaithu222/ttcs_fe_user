export const SOCKET_NAMESPACES = {
  ROOT: "/",
  NOTIFICATIONS: "/notifications",
  ADMIN_CHAT: "/chat/admin",
  SHOP_CHAT: "/chat/shop",
  AI_CHAT: "/chat/ai",
} as const;

export type SocketNamespace =
  (typeof SOCKET_NAMESPACES)[keyof typeof SOCKET_NAMESPACES];

export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  ERROR: "error",
  SYSTEM_READY: "system:ready",
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  CHAT_CONVERSATION_JOIN: "chat:conversation:join",
  CHAT_CONVERSATION_LEAVE: "chat:conversation:leave",
  CHAT_MESSAGE_SEND: "chat:message:send",
  CHAT_MESSAGE_RECEIVE: "chat:message:receive",
  CHAT_TYPING: "chat:typing",
  CHAT_DELIVERED: "chat:delivered",
  CHAT_SEEN: "chat:seen",
  NOTIFICATION_SUBSCRIBE: "notification:subscribe",
  NOTIFICATION_SEND: "notification:send",
  NOTIFICATION_ACK: "notification:ack",
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export const SOCKET_CHAT_CHANNELS = {
  ADMIN: "admin",
  SHOP: "shop",
  AI: "ai",
} as const;

export type SocketChatChannel =
  (typeof SOCKET_CHAT_CHANNELS)[keyof typeof SOCKET_CHAT_CHANNELS];

export const buildNotificationRoom = (userId: string) =>
  `notification:user:${userId}`;

export const buildChatConversationRoom = (
  channel: SocketChatChannel,
  conversationId: string
) => `chat:${channel}:${conversationId}`;

export const buildDirectUserRoom = (userId: string) => `user:${userId}`;


