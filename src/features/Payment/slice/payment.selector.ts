import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import type { PaymentState } from "./payment.type";

const selectPaymentState = (state: RootState): PaymentState => state.payment;

// Checkout selectors
export const selectCheckout = createSelector(selectPaymentState, (state) => state.checkout);
export const selectCheckoutStatus = createSelector(selectPaymentState, (state) => state.checkout.status);
export const selectCheckoutError = createSelector(selectPaymentState, (state) => state.checkout.error);
export const selectCheckoutData = createSelector(selectPaymentState, (state) => state.checkout.data);
export const selectIsCheckoutLoading = createSelector(
  selectCheckoutStatus,
  (status) => status === "LOADING"
);

// Payment Methods selectors
export const selectPaymentMethods = createSelector(
  selectPaymentState,
  (state) => state.paymentMethods.data
);
export const selectPaymentMethodsStatus = createSelector(
  selectPaymentState,
  (state) => state.paymentMethods.status
);
export const selectPaymentMethodsError = createSelector(
  selectPaymentState,
  (state) => state.paymentMethods.error
);
export const selectIsPaymentMethodsLoading = createSelector(
  selectPaymentMethodsStatus,
  (status) => status === "LOADING"
);

// Payment Status selectors
export const selectPaymentStatus = createSelector(
  selectPaymentState,
  (state) => state.paymentStatus.data
);
export const selectPaymentStatusState = createSelector(
  selectPaymentState,
  (state) => state.paymentStatus.status
);
export const selectPaymentStatusError = createSelector(
  selectPaymentState,
  (state) => state.paymentStatus.error
);
export const selectIsPaymentStatusLoading = createSelector(
  selectPaymentStatusState,
  (status) => status === "LOADING"
);

// Payment History selectors
export const selectPaymentHistory = createSelector(
  selectPaymentState,
  (state) => state.paymentHistory.data
);
export const selectPaymentHistoryPagination = createSelector(
  selectPaymentState,
  (state) => state.paymentHistory.pagination
);
export const selectPaymentHistoryStatus = createSelector(
  selectPaymentState,
  (state) => state.paymentHistory.status
);
export const selectPaymentHistoryError = createSelector(
  selectPaymentState,
  (state) => state.paymentHistory.error
);
export const selectIsPaymentHistoryLoading = createSelector(
  selectPaymentHistoryStatus,
  (status) => status === "LOADING"
);
