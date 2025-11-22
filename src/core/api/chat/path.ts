// Chat API endpoints for users
export const CHAT_ENDPOINTS = {
  CONVERSATIONS: "/chat/conversations",
  CREATE_CONVERSATION: "/chat/conversations",
  CONVERSATION_DETAIL: "/chat/conversations/:id",
  MESSAGES: "/chat/conversations/:id/messages",
  SEND_MESSAGE: "/chat/conversations/:id/messages",
  MARK_AS_READ: "/chat/conversations/:id/read",
  MARK_AS_DELIVERED: "/chat/conversations/:id/delivered",
} as const;

// Generic endpoint builder
export const buildEndpoint = (
  endpoint: string,
  params?: Record<string, string | number>
): string => {
  if (!params) return endpoint;

  return Object.entries(params).reduce((url, [key, value]) => {
    return url.replace(`:${key}`, String(value));
  }, endpoint);
};

