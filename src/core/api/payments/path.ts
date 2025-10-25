// Payments API endpoints for users
export const USER_PAYMENTS_ENDPOINTS = {
  CHECKOUT: "/payments/checkout",
  STATUS: "/payments/status/:orderId",
  HISTORY: "/payments/history",
  METHODS: "/payments/methods",
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
