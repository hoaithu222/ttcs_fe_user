// Products API endpoints for users
export const USER_PRODUCTS_ENDPOINTS = {
  LIST: "/products",
  DETAIL: "/products/:id",
  SEARCH: "/products/search",
  FEATURED: "/products/featured",
  RECOMMENDED: "/products/recommended",
  RELATED: "/products/:id/related",
  REVIEWS: "/products/:id/reviews",
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
