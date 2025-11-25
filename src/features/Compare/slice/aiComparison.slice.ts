import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxStateType } from "@/app/store/types";
import { buildComparisonKey } from "../constants/aiComparison";
import type {
  AiComparisonFailurePayload,
  AiComparisonState,
  AiComparisonSuccessPayload,
  ComparableProduct,
  CompareWithAiPayload,
  ComparisonProductSummary,
} from "../types/aiComparison";

const getPrimaryImage = (product: ComparableProduct): string | undefined => {
  const firstImage = product.images?.[0];
  if (!firstImage) return undefined;
  if (typeof firstImage === "string") return firstImage;
  return firstImage.url;
};

const toSummary = (product: ComparableProduct): ComparisonProductSummary => ({
  id: product._id,
  name: product.name,
  image: getPrimaryImage(product),
  price: product.price,
  finalPrice: product.finalPrice,
  rating: product.rating,
});

const initialState: AiComparisonState = {
  entities: {},
  lastRequestedKey: undefined,
};

const aiComparisonSlice = createSlice({
  name: "aiComparison",
  initialState,
  reducers: {
    compareProductsWithAiStart: (state, action: PayloadAction<CompareWithAiPayload>) => {
      const { primaryProduct, secondaryProduct } = action.payload;
      const key = buildComparisonKey(primaryProduct._id, secondaryProduct._id);

      state.lastRequestedKey = key;

      state.entities[key] = {
        ...(state.entities[key] || {
          key,
          productAId: primaryProduct._id,
          productBId: secondaryProduct._id,
        }),
        key,
        productAId: primaryProduct._id,
        productBId: secondaryProduct._id,
        products: {
          [primaryProduct._id]: toSummary(primaryProduct),
          [secondaryProduct._id]: toSummary(secondaryProduct),
        },
        status: ReduxStateType.LOADING,
        error: null,
      };
    },
    compareProductsWithAiSuccess: (state, action: PayloadAction<AiComparisonSuccessPayload>) => {
      const entity = state.entities[action.payload.key];
      if (!entity) return;

      entity.status = ReduxStateType.SUCCESS;
      entity.summary = action.payload.summary;
      entity.prosCons = action.payload.prosCons;
      entity.audienceFit = action.payload.audienceFit;
      entity.verdict = action.payload.verdict;
      entity.provider = action.payload.provider;
      entity.tips = action.payload.tips;
      entity.error = null;
      entity.updatedAt = Date.now();
    },
    compareProductsWithAiFailure: (state, action: PayloadAction<AiComparisonFailurePayload>) => {
      const entity = state.entities[action.payload.key];
      if (!entity) {
        state.entities[action.payload.key] = {
          key: action.payload.key,
          productAId: "",
          productBId: "",
          products: {},
          status: ReduxStateType.ERROR,
          error: action.payload.error,
        };
        return;
      }

      entity.status = ReduxStateType.ERROR;
      entity.error = action.payload.error;
    },
    clearComparison: (state, action: PayloadAction<string | undefined>) => {
      if (!action.payload) {
        state.entities = {};
        state.lastRequestedKey = undefined;
        return;
      }

      delete state.entities[action.payload];
      if (state.lastRequestedKey === action.payload) {
        state.lastRequestedKey = undefined;
      }
    },
  },
});

export const {
  compareProductsWithAiStart,
  compareProductsWithAiSuccess,
  compareProductsWithAiFailure,
  clearComparison,
} = aiComparisonSlice.actions;

export default aiComparisonSlice.reducer;

