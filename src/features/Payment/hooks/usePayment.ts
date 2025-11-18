import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  createCheckoutStart,
  getPaymentMethodsStart,
  getPaymentStatusStart,
  getPaymentHistoryStart,
  resetPaymentState,
} from "../slice/payment.slice";
import {
  selectCheckout,
  selectCheckoutStatus,
  selectCheckoutError,
  selectCheckoutData,
  selectIsCheckoutLoading,
  selectPaymentMethods,
  selectPaymentMethodsStatus,
  selectPaymentMethodsError,
  selectIsPaymentMethodsLoading,
  selectPaymentStatus,
  selectPaymentStatusState,
  selectPaymentStatusError,
  selectIsPaymentStatusLoading,
  selectPaymentHistory,
  selectPaymentHistoryPagination,
  selectPaymentHistoryStatus,
  selectPaymentHistoryError,
  selectIsPaymentHistoryLoading,
} from "../slice/payment.selector";
import type { PaymentHistoryQuery } from "@/core/api/payments/type";

export const usePayment = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const checkout = useAppSelector(selectCheckout);
  const checkoutStatus = useAppSelector(selectCheckoutStatus);
  const checkoutError = useAppSelector(selectCheckoutError);
  const checkoutData = useAppSelector(selectCheckoutData);
  const isCheckoutLoading = useAppSelector(selectIsCheckoutLoading);

  const paymentMethods = useAppSelector(selectPaymentMethods);
  const paymentMethodsStatus = useAppSelector(selectPaymentMethodsStatus);
  const paymentMethodsError = useAppSelector(selectPaymentMethodsError);
  const isPaymentMethodsLoading = useAppSelector(selectIsPaymentMethodsLoading);

  const paymentStatus = useAppSelector(selectPaymentStatus);
  const paymentStatusState = useAppSelector(selectPaymentStatusState);
  const paymentStatusError = useAppSelector(selectPaymentStatusError);
  const isPaymentStatusLoading = useAppSelector(selectIsPaymentStatusLoading);

  const paymentHistory = useAppSelector(selectPaymentHistory);
  const paymentHistoryPagination = useAppSelector(selectPaymentHistoryPagination);
  const paymentHistoryStatus = useAppSelector(selectPaymentHistoryStatus);
  const paymentHistoryError = useAppSelector(selectPaymentHistoryError);
  const isPaymentHistoryLoading = useAppSelector(selectIsPaymentHistoryLoading);

  // Actions
  const createCheckout = useCallback(
    (orderId: string, paymentMethod: string) => {
      dispatch(createCheckoutStart({ orderId, paymentMethod }));
    },
    [dispatch]
  );

  const getPaymentMethods = useCallback(() => {
    dispatch(getPaymentMethodsStart());
  }, [dispatch]);

  const getPaymentStatus = useCallback(
    (orderId: string) => {
      dispatch(getPaymentStatusStart(orderId));
    },
    [dispatch]
  );

  const getPaymentHistory = useCallback(
    (query?: PaymentHistoryQuery) => {
      dispatch(getPaymentHistoryStart(query));
    },
    [dispatch]
  );

  const resetPayment = useCallback(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);

  return {
    // Checkout
    checkout,
    checkoutStatus,
    checkoutError,
    checkoutData,
    isCheckoutLoading,
    createCheckout,

    // Payment Methods
    paymentMethods,
    paymentMethodsStatus,
    paymentMethodsError,
    isPaymentMethodsLoading,
    getPaymentMethods,

    // Payment Status
    paymentStatus,
    paymentStatusState,
    paymentStatusError,
    isPaymentStatusLoading,
    getPaymentStatus,

    // Payment History
    paymentHistory,
    paymentHistoryPagination,
    paymentHistoryStatus,
    paymentHistoryError,
    isPaymentHistoryLoading,
    getPaymentHistory,

    // Reset
    resetPayment,
  };
};
