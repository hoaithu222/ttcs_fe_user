// Home API endpoints for users
export const HOME_ENDPOINTS = {
  BANNER: "/home/banner",
  CATEGORIES: "/home/categories",
  BEST_SELLER: "/home/best-seller",
  BEST_SHOPS: "/home/best-shops",
  FLASH_SALE: "/home/flash-sale",
  SEARCH_SUGGESTION: "/home/search-suggestion",
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
