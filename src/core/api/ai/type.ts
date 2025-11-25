export interface GenerateProductDescriptionRequest {
  productName: string;
  specs?: Record<string, string>;
  tone?: "default" | "marketing" | "technical" | "casual";
  language?: string;
  keywords?: string[];
}

export interface AiProductDescriptionMeta {
  keywords?: string[];
  seoTitle?: string;
  metaDescription?: string;
}

export interface GenerateProductDescriptionResponse {
  content: string;
  outline?: string[];
  meta?: AiProductDescriptionMeta;
}

export interface GenerateProductMetaRequest {
  productName: string;
  specs?: Record<string, string>;
  category?: string;
  language?: string;
}

export interface GenerateProductMetaResponse {
  keywords: string[];
  warrantyInfo?: string;
  highlights?: string[];
}

export interface GenerateChatResponseRequest {
  message: string;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  language?: string;
}

export interface ComparisonProductPayload {
  _id: string;
  name: string;
  brand?: string;
  category?: string;
  subCategory?: string;
  price: number;
  finalPrice?: number;
  rating?: number;
  reviewCount?: number;
  highlights?: string[];
  specs?: Record<string, string | number>;
  meta?: Record<string, string | number>;
  images?: string[];
  extra?: Record<string, unknown>;
}

export interface AiComparisonProsCons {
  pros: string[];
  cons: string[];
}

export interface AiAudienceFitRecommendation {
  title: string;
  description?: string;
}

export interface GenerateProductComparisonRequest {
  products: ComparisonProductPayload[];
  language?: string;
  context?: "product-detail" | "compare-page";
}

export interface GenerateProductComparisonResponse {
  summary: string;
  prosCons?: Record<string, AiComparisonProsCons>;
  audienceFit?: Record<string, AiAudienceFitRecommendation>;
  verdict?: string;
  provider?: "openai" | "gemini" | "fallback";
  tips?: string[];
}

export interface VisualSearchRequest {
  image: string;
  mimeType?: string;
  limit?: number;
  language?: string;
}

export interface VisualSearchResponse {
  keywords: string[];
  rawDescription?: string;
  products: any[];
  provider?: "gemini" | "fallback";
}

export interface SuggestedProduct {
  _id: string;
  name: string;
  price: number;
  finalPrice: number;
  images?: Array<{ url: string }>;
  shop?: { name: string; _id: string };
}

export interface SuggestedShop {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  rating?: number;
  followCount?: number;
  productCount?: number;
  reviewCount?: number;
  isVerified?: boolean;
}

export interface SuggestedCategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
  slug?: string;
}

export interface GenerateChatResponseResponse {
  response: string;
  suggestedProducts?: SuggestedProduct[];
  suggestedShops?: SuggestedShop[];
  suggestedCategories?: SuggestedCategory[];
  responseType?: "text" | "product" | "shop" | "category" | "mixed";
  provider?: "openai" | "gemini" | "fallback";
}

export interface ApiSuccess<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  timestamp: string;
  code: number;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
  path: string;
  method: string;
  code: number;
}

