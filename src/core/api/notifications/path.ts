// Notifications API endpoints for users
export const USER_NOTIFICATIONS_ENDPOINTS = {
  LIST: "/notifications",
  MARK_READ: "/notifications/:id/read",
  MARK_ALL_READ: "/notifications/read-all",
  DELETE: "/notifications/:id",
  UNREAD_COUNT: "/notifications/unread-count",
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
