// Images API endpoints
export const IMAGES_ENDPOINTS = {
  LIST: "/images",
  DETAIL: "/images/:id",
  CREATE: "/images",
  UPLOAD: "/images/upload",
  UPDATE: "/images/:id",
  DELETE: "/images/:id",
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

