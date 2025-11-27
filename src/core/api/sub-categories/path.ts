export const USER_SUB_CATEGORIES_ENDPOINTS = {
  LIST: "/sub-category",
  DETAIL: "/sub-category/:id",
} as const;

export const buildEndpoint = (
  endpoint: string,
  params?: Record<string, string | number>
) => {
  if (!params) return endpoint;
  return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`:${key}`, String(value)), endpoint);
};


