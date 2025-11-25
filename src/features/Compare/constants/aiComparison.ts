export const COMPARISON_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
export const AI_COMPARISON_CONTEXT = {
  PRODUCT_DETAIL: "product-detail",
  COMPARE_PAGE: "compare-page",
} as const;

export type AiComparisonContext = (typeof AI_COMPARISON_CONTEXT)[keyof typeof AI_COMPARISON_CONTEXT];

export const buildComparisonKey = (productAId: string, productBId: string): string => {
  return [productAId, productBId].sort().join("__");
};

export const MAX_SUGGESTIONS = 6;
export const SEARCH_DEBOUNCE_MS = 400;

