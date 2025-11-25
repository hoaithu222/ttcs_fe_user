import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { ReduxStateType } from "@/app/store/types";
import { useLanguage } from "@/shared/hooks/language";
import { buildComparisonKey, COMPARISON_CACHE_TTL } from "../constants/aiComparison";
import { compareProductsWithAiStart } from "../slice/aiComparison.slice";
import type { ComparableProduct } from "../types/aiComparison";

export const useAiComparison = (
  primaryProduct?: ComparableProduct | null,
  secondaryProduct?: ComparableProduct | null
) => {
  const dispatch = useAppDispatch();
  const language = useLanguage() || "vi";

  const comparisonKey = useMemo(() => {
    if (!primaryProduct?._id || !secondaryProduct?._id) return undefined;
    return buildComparisonKey(primaryProduct._id, secondaryProduct._id);
  }, [primaryProduct?._id, secondaryProduct?._id]);

  const comparison = useAppSelector((state) =>
    comparisonKey ? state.aiComparison.entities[comparisonKey] : undefined
  );

  const isStale = useMemo(() => {
    if (!comparison?.updatedAt) return true;
    return Date.now() - comparison.updatedAt > COMPARISON_CACHE_TTL;
  }, [comparison?.updatedAt]);

  const triggerComparison = useCallback(
    (context: "product-detail" | "compare-page" = "product-detail") => {
      if (!primaryProduct || !secondaryProduct) return;
      dispatch(
        compareProductsWithAiStart({
          primaryProduct,
          secondaryProduct,
          language,
          context,
        })
      );
    },
    [dispatch, language, primaryProduct, secondaryProduct]
  );

  const isLoading = comparison?.status === ReduxStateType.LOADING;
  const hasError = comparison?.status === ReduxStateType.ERROR;

  return {
    comparison,
    comparisonKey,
    triggerComparison,
    isLoading,
    hasError,
    isStale,
  };
};

