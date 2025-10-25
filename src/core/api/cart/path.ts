// Cart API endpoints for users
export const USER_CART_ENDPOINTS = {
  GET: "/cart",
  ADD_ITEM: "/cart/items",
  UPDATE_ITEM: "/cart/items/:itemId",
  DELETE_ITEM: "/cart/items/:itemId",
  CLEAR: "/cart",
  APPLY_COUPON: "/cart/coupon",
  REMOVE_COUPON: "/cart/coupon",
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
