// Orders API endpoints for users
export const USER_ORDERS_ENDPOINTS = {
  LIST: "/orders",
  DETAIL: "/orders/:id",
  CREATE: "/orders",
  CANCEL: "/orders/:id/cancel",
  TRACK: "/orders/:id/track",
  REORDER: "/orders/:id/reorder",
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
