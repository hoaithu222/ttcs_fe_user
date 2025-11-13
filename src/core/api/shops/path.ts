// Shops API endpoints for users
export const USER_SHOPS_ENDPOINTS = {
  LIST: "/shops",
  DETAIL: "/shops/:id",
  FOLLOW: "/shops/:id/follow",
  UNFOLLOW: "/shops/:id/follow",
  FOLLOWING: "/shops/:id/following",
  FOLLOWERS_COUNT: "/shops/:id/followers/count",
  PRODUCTS: "/shops/:id/products",
  REVIEWS: "/shops/:id/reviews",
  FEATURED: "/shops/featured",
  NEARBY: "/shops/nearby",
  SHOP_STATUS_BY_USER: "/shops/status/user/:userId",
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
