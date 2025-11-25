export const AI_ENDPOINTS = {
  GENERATE_PRODUCT_DESCRIPTION: "/ai/product-description",
  GENERATE_PRODUCT_META: "/ai/product-meta",
  GENERATE_CHAT_RESPONSE: "/ai/chat",
  GENERATE_PRODUCT_COMPARISON: "/ai/product-comparison",
  VISUAL_SEARCH: "/ai/visual-search",
} as const;

export type AiEndpointKey = keyof typeof AI_ENDPOINTS;

export const buildAiEndpoint = (key: AiEndpointKey): string => AI_ENDPOINTS[key];

