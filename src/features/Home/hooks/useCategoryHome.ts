import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  fetchHomeCategoriesStart,
  selectHomeCategories,
  selectHomeCategoriesStatus,
  selectHomeCategoriesError,
} from "../slice";

export const useCategoryHome = (page = 1, limit = 10) => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectHomeCategories);
  const status = useAppSelector(selectHomeCategoriesStatus);
  const error = useAppSelector(selectHomeCategoriesError);

  useEffect(() => {
    dispatch(fetchHomeCategoriesStart({ page, limit }));
  }, [dispatch, page, limit]);

  return {
    categories,
    isLoading: status === "LOADING",
    error,
  };
};
