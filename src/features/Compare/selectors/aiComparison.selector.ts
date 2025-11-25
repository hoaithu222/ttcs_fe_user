import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { COMPARISON_CACHE_TTL, buildComparisonKey } from "../constants/aiComparison";

export const selectAiComparisonState = (state: RootState) => state.aiComparison;

export const makeSelectComparisonByProducts = (
  productAId?: string,
  productBId?: string
) =>
  createSelector(selectAiComparisonState, (state) => {
    if (!productAId || !productBId) return undefined;
    const key = buildComparisonKey(productAId, productBId);
    return state.entities[key];
  });

export const selectComparisonByKey = (key?: string) =>
  createSelector(selectAiComparisonState, (state) => {
    if (!key) return undefined;
    return state.entities[key];
  });

export const makeSelectIsComparisonStale = (key?: string) =>
  createSelector(selectAiComparisonState, (state) => {
    if (!key) return true;
    const entity = state.entities[key];
    if (!entity?.updatedAt) return true;
    return Date.now() - entity.updatedAt > COMPARISON_CACHE_TTL;
  });

