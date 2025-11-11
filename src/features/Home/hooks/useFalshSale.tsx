import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  fetchFlashSaleProductsStart,
  selectFlashSaleProducts,
  selectFlashSaleProductsStatus,
  selectFlashSaleProductsError,
} from "../slice";

export const useFlashSale = (page = 1, limit = 10) => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectFlashSaleProducts);
  const status = useAppSelector(selectFlashSaleProductsStatus);
  const error = useAppSelector(selectFlashSaleProductsError);

  useEffect(() => {
    dispatch(fetchFlashSaleProductsStart({ page, limit }));
  }, [dispatch, page, limit]);

  return {
    products,
    isLoading: status === "LOADING",
    error,
  };
};
