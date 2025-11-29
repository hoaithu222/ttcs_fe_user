import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxStateType } from "@/app/store/types";
import type { PaymentState } from "./payment.type";
import type {
  Payment,
  PaymentMethod,
  CheckoutResponse,
  PaymentHistoryResponse,
} from "@/core/api/payments/type";

const initialState: PaymentState = {
  checkout: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    data: null,
  },
  paymentMethods: {
    status: ReduxStateType.INIT,
    error: null,
    data: [],
  },
  paymentStatus: {
    status: ReduxStateType.INIT,
    error: null,
    data: null,
  },
  paymentHistory: {
    status: ReduxStateType.INIT,
    error: null,
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    // Create Checkout
    createCheckoutStart: (state, _action: PayloadAction<{ orderId: string; paymentMethod: string }>) => {
      state.checkout.status = ReduxStateType.LOADING;
      state.checkout.error = null;
      state.checkout.message = null;
    },
    createCheckoutSuccess: (state, action: PayloadAction<CheckoutResponse>) => {
      console.log("[PaymentSlice] createCheckoutSuccess reducer called with:", action.payload);
      state.checkout.status = ReduxStateType.SUCCESS;
      state.checkout.data = action.payload;
      state.checkout.error = null;
      console.log("[PaymentSlice] State updated:", {
        status: state.checkout.status,
        hasData: !!state.checkout.data,
        paymentId: state.checkout.data?.paymentId,
      });
    },
    createCheckoutFailure: (state, action: PayloadAction<string>) => {
      state.checkout.status = ReduxStateType.ERROR;
      state.checkout.error = action.payload;
    },

    // Get Payment Methods
    getPaymentMethodsStart: (state) => {
      state.paymentMethods.status = ReduxStateType.LOADING;
      state.paymentMethods.error = null;
    },
    getPaymentMethodsSuccess: (state, action: PayloadAction<PaymentMethod[]>) => {
      state.paymentMethods.status = ReduxStateType.SUCCESS;
      state.paymentMethods.data = action.payload;
      state.paymentMethods.error = null;
    },
    getPaymentMethodsFailure: (state, action: PayloadAction<string>) => {
      state.paymentMethods.status = ReduxStateType.ERROR;
      state.paymentMethods.error = action.payload;
    },

    // Get Payment Status
    getPaymentStatusStart: (state, _action: PayloadAction<string>) => {
      state.paymentStatus.status = ReduxStateType.LOADING;
      state.paymentStatus.error = null;
    },
    getPaymentStatusSuccess: (state, action: PayloadAction<Payment>) => {
      state.paymentStatus.status = ReduxStateType.SUCCESS;
      state.paymentStatus.data = action.payload;
      state.paymentStatus.error = null;
    },
    getPaymentStatusFailure: (state, action: PayloadAction<string>) => {
      state.paymentStatus.status = ReduxStateType.ERROR;
      state.paymentStatus.error = action.payload;
    },

    // Get Payment History
    getPaymentHistoryStart: (state, _action: PayloadAction<PaymentHistoryQuery | undefined>) => {
      state.paymentHistory.status = ReduxStateType.LOADING;
      state.paymentHistory.error = null;
    },
    getPaymentHistorySuccess: (state, action: PayloadAction<PaymentHistoryResponse>) => {
      state.paymentHistory.status = ReduxStateType.SUCCESS;
      state.paymentHistory.data = action.payload.payments;
      state.paymentHistory.pagination = action.payload.pagination;
      state.paymentHistory.error = null;
    },
    getPaymentHistoryFailure: (state, action: PayloadAction<string>) => {
      state.paymentHistory.status = ReduxStateType.ERROR;
      state.paymentHistory.error = action.payload;
    },

    // Reset Payment State
    resetPaymentState: (state) => {
      state.checkout = initialState.checkout;
      state.paymentStatus = initialState.paymentStatus;
    },
  },
});

export const {
  createCheckoutStart,
  createCheckoutSuccess,
  createCheckoutFailure,
  getPaymentMethodsStart,
  getPaymentMethodsSuccess,
  getPaymentMethodsFailure,
  getPaymentStatusStart,
  getPaymentStatusSuccess,
  getPaymentStatusFailure,
  getPaymentHistoryStart,
  getPaymentHistorySuccess,
  getPaymentHistoryFailure,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;
