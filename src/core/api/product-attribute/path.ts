// Product Attributes API endpoints for users
export const USER_PRODUCT_ATTRIBUTES_ENDPOINTS = {
  LIST: "/product-attributes",
  DETAIL: "/product-attributes/:id",
  BY_PRODUCT: "/product-attributes/product/:productId",
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

