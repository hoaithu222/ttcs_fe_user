// Reviews API endpoints for users
export const USER_REVIEWS_ENDPOINTS = {
  PRODUCT_REVIEWS: "/products/:productId/reviews",
  CREATE_REVIEW: "/products/:productId/reviews",
  SHOP_REVIEWS: "/shops/:shopId/reviews",
  UPDATE_REVIEW: "/reviews/:reviewId",
  DELETE_REVIEW: "/reviews/:reviewId",
  USER_REVIEWS: "/reviews/user",
  HELPFUL: "/reviews/:reviewId/helpful",
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
