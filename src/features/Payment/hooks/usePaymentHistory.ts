import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { getPaymentHistoryStart } from "../slice/payment.slice";
import {
  selectPaymentHistoryData,
  selectPaymentHistoryPagination,
  selectIsPaymentHistoryLoading,
  selectPaymentHistoryError,
} from "../slice/payment.selector";
import type { PaymentHistoryQuery } from "@/core/api/payments/type";

export const usePaymentHistory = () => {
  const dispatch = useAppDispatch();

  const paymentHistory = useAppSelector(selectPaymentHistoryData);
  const pagination = useAppSelector(selectPaymentHistoryPagination);
  const isLoading = useAppSelector(selectIsPaymentHistoryLoading);
  const error = useAppSelector(selectPaymentHistoryError);

  const fetchPaymentHistory = useCallback(
    (query?: PaymentHistoryQuery) => {
      dispatch(getPaymentHistoryStart(query));
    },
    [dispatch]
  );

  return {
    paymentHistory,
    pagination,
    isLoading,
    error,
    fetchPaymentHistory,
  };
};

