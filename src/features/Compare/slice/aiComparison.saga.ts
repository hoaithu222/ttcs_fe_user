import { call, put, takeLatest } from "redux-saga/effects";
import { aiAssistantApi } from "@/core/api/ai";
import { addToast } from "@/app/store/slices/toast";
import type {
  ComparisonProductPayload,
  GenerateProductComparisonRequest,
} from "@/core/api/ai/type";
import { buildComparisonKey } from "../constants/aiComparison";
import {
  compareProductsWithAiFailure,
  compareProductsWithAiStart,
  compareProductsWithAiSuccess,
} from "./aiComparison.slice";
import type { ComparableProduct } from "../types/aiComparison";

const stripHtml = (value?: string): string | undefined => {
  if (!value) return undefined;
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const collectHighlights = (product: ComparableProduct): string[] => {
  const highlights: string[] = [];

  if (Array.isArray(product.highlights)) {
    highlights.push(...product.highlights);
  }

  if (product.warrantyInfo) {
    highlights.push(`Bảo hành: ${product.warrantyInfo}`);
  }

  if (product.dimensions) {
    highlights.push(`Kích thước: ${product.dimensions}`);
  }

  if (product.weight) {
    highlights.push(`Khối lượng: ${product.weight}g`);
  }

  if (product.metaKeywords) {
    highlights.push(
      ...product.metaKeywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    );
  }

  const plainDescription = stripHtml(product.description);
  if (plainDescription) {
    highlights.push(plainDescription.slice(0, 200));
  }

  return Array.from(new Set(highlights)).slice(0, 8);
};

const collectSpecs = (product: ComparableProduct): Record<string, string | number> | undefined => {
  const specs: Record<string, string | number> = {};
  const attributes = (product as any)?.attributes || product.attributes;

  if (Array.isArray(attributes)) {
    attributes.forEach((attr: { name?: string; value?: string }) => {
      if (attr?.name && attr?.value) {
        specs[attr.name] = attr.value;
      }
    });
  }

  if (product.dimensions) {
    specs["Dimensions"] = product.dimensions;
  }

  if (product.weight) {
    specs["Weight"] = product.weight;
  }

  if (product.warrantyInfo) {
    specs["Warranty"] = product.warrantyInfo;
  }

  return Object.keys(specs).length > 0 ? specs : undefined;
};

const normalizeImages = (product: ComparableProduct): string[] | undefined => {
  if (!Array.isArray(product.images) || product.images.length === 0) return undefined;
  const normalized = product.images
    .map((image) => {
      if (typeof image === "string") return image;
      if (typeof image === "object" && image) {
        return image.url || (image as any).secure_url;
      }
      return undefined;
    })
    .filter(Boolean) as string[];

  return normalized.length > 0 ? normalized.slice(0, 3) : undefined;
};

const mapProductToComparisonPayload = (product: ComparableProduct): ComparisonProductPayload => ({
  _id: product._id,
  name: product.name,
  brand: product.metaKeywords?.split(",")?.[0]?.trim(),
  category: product.category?.name,
  subCategory: product.subCategory?.name,
  price: product.price,
  finalPrice: product.finalPrice,
  rating: product.rating,
  reviewCount: product.reviewCount,
  highlights: collectHighlights(product),
  specs: collectSpecs(product),
  meta: {
    warrantyInfo: product.warrantyInfo,
    weight: product.weight,
    dimensions: product.dimensions,
    salesCount: product.salesCount,
    viewCount: product.viewCount,
  },
  images: normalizeImages(product),
  extra: {
    shopName: product.shop?.name,
    shopRating: product.shop?.rating,
  },
});

function* handleCompareProductsWithAi(
  action: ReturnType<typeof compareProductsWithAiStart>
): Generator {
  const {
    primaryProduct,
    secondaryProduct,
    language = "vi",
    context = "product-detail",
  } = action.payload;

  const comparisonKey = buildComparisonKey(primaryProduct._id, secondaryProduct._id);

  try {
    const payload: GenerateProductComparisonRequest = {
      products: [
        mapProductToComparisonPayload(primaryProduct),
        mapProductToComparisonPayload(secondaryProduct),
      ],
      language,
      context,
    };

    const response: any = yield call(
      [aiAssistantApi, aiAssistantApi.generateProductComparison],
      payload
    );

    if (response?.success && response.data) {
      yield put(
        compareProductsWithAiSuccess({
          key: comparisonKey,
          summary: response.data.summary,
          prosCons: response.data.prosCons,
          audienceFit: response.data.audienceFit,
          verdict: response.data.verdict,
          provider: response.data.provider,
          tips: response.data.tips,
        })
      );
      return;
    }

    throw new Error(response?.message || "Không thể so sánh sản phẩm");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể so sánh sản phẩm. Vui lòng thử lại.";
    yield put(compareProductsWithAiFailure({ key: comparisonKey, error: message }));
    yield put(addToast({ type: "error", message }));
  }
}

export function* aiComparisonSaga() {
  yield takeLatest(compareProductsWithAiStart.type, handleCompareProductsWithAi);
}

