// Categories API endpoints for users
export const USER_CATEGORIES_ENDPOINTS = {
  LIST: "/category",
  DETAIL: "/category/:id",
  SUB_CATEGORIES: "/category/:id/sub-categories",
  POPULAR: "/category/popular",
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
