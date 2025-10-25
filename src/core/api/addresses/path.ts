// Addresses API endpoints for users
export const USER_ADDRESSES_ENDPOINTS = {
  LIST: "/addresses",
  DETAIL: "/addresses/:id",
  CREATE: "/addresses",
  UPDATE: "/addresses/:id",
  DELETE: "/addresses/:id",
  SET_DEFAULT: "/addresses/:id/default",
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
