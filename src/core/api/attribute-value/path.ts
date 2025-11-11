// Attribute Values API endpoints for users
export const USER_ATTRIBUTE_VALUES_ENDPOINTS = {
  LIST: "/attribute-values",
  DETAIL: "/attribute-values/:id",
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

