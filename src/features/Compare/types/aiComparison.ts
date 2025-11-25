import type { Product } from "@/core/api/products/type";
import type { AiAudienceFitRecommendation, AiComparisonProsCons } from "@/core/api/ai/type";
import type { ReduxStateType } from "@/app/store/types";

export interface ComparableProduct extends Product {
  attributes?: Array<{
    name: string;
    value: string;
  }>;
  highlights?: string[];
}

export interface ComparisonProductSummary {
  id: string;
  name: string;
  image?: string;
  price?: number;
  finalPrice?: number;
  rating?: number;
}

export interface AiComparisonEntity {
  key: string;
  productAId: string;
  productBId: string;
  products: Record<string, ComparisonProductSummary>;
  status: ReduxStateType;
  summary?: string;
  prosCons?: Record<string, AiComparisonProsCons>;
  audienceFit?: Record<string, AiAudienceFitRecommendation>;
  verdict?: string;
  tips?: string[];
  provider?: string;
  updatedAt?: number;
  error?: string | null;
}

export interface AiComparisonState {
  entities: Record<string, AiComparisonEntity>;
  lastRequestedKey?: string;
}

export interface CompareWithAiPayload {
  primaryProduct: ComparableProduct;
  secondaryProduct: ComparableProduct;
  language?: string;
  context?: "product-detail" | "compare-page";
}

export interface AiComparisonSuccessPayload {
  key: string;
  summary: string;
  prosCons?: Record<string, AiComparisonProsCons>;
  audienceFit?: Record<string, AiAudienceFitRecommendation>;
  verdict?: string;
  provider?: string;
  tips?: string[];
}

export interface AiComparisonFailurePayload {
  key: string;
  error: string;
}

