// Shop Management API endpoints
export const SHOP_MANAGEMENT_ENDPOINTS = {
  SHOP_INFO: "/shops/my-shop",
  UPDATE_SHOP: "/shops/my-shop",
  CREATE_SHOP: "/shops",
  PRODUCTS: "/shops/my-shop/products",
  CREATE_PRODUCT: "/shops/my-shop/products",
  UPDATE_PRODUCT: "/shops/my-shop/products/:productId",
  DELETE_PRODUCT: "/shops/my-shop/products/:productId",
  ORDERS: "/shops/my-shop/orders",
  ORDER_DETAIL: "/shops/my-shop/orders/:orderId",
  UPDATE_ORDER_STATUS: "/shops/my-shop/orders/:orderId/status",
  FOLLOWERS: "/shops/my-shop/followers",
  REVIEWS: "/shops/my-shop/reviews",
  ANALYTICS: "/shops/my-shop/analytics",
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
