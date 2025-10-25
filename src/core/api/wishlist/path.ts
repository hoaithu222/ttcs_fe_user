// Wishlist API endpoints for users
export const USER_WISHLIST_ENDPOINTS = {
  LIST: "/wishlist",
  ADD_ITEM: "/wishlist/:productId",
  REMOVE_ITEM: "/wishlist/:productId",
  CLEAR: "/wishlist",
  CHECK: "/wishlist/:productId/check",
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
