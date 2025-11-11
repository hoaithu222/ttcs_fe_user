import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  fetchBestShopsStart,
  selectBestShops,
  selectBestShopsStatus,
  selectBestShopsError,
} from "../slice";

export const useBestShop = (page = 1, limit = 10) => {
  const dispatch = useAppDispatch();
  const shops = useAppSelector(selectBestShops);
  const status = useAppSelector(selectBestShopsStatus);
  const error = useAppSelector(selectBestShopsError);

  useEffect(() => {
    dispatch(fetchBestShopsStart({ page, limit }));
  }, [dispatch, page, limit]);

  return {
    shops,
    isLoading: status === "LOADING",
    error,
  };
};
