import { call, put, takeEvery } from "redux-saga/effects";
import { userPaymentsApi } from "@/core/api/payments";
import { addToast } from "@/app/store/slices/toast";
import {
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
} from "./payment.slice";
import type { CheckoutRequest, PaymentHistoryQuery } from "@/core/api/payments/type";

// Helper function để lấy error message
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e?.response?.data?.message || e?.message || fallback;
  }
  return fallback;
};

type CreateCheckoutAction = ReturnType<typeof createCheckoutStart>;
type GetPaymentMethodsAction = ReturnType<typeof getPaymentMethodsStart>;
type GetPaymentStatusAction = ReturnType<typeof getPaymentStatusStart>;
type GetPaymentHistoryAction = ReturnType<typeof getPaymentHistoryStart>;

function* createCheckoutWorker(action: CreateCheckoutAction): Generator {
  try {
    const { orderId, paymentMethod } = action.payload;
    const checkoutRequest: CheckoutRequest = {
      orderId,
      paymentMethod,
      returnUrl: `${window.location.origin}/payment/${orderId}`,
      cancelUrl: `${window.location.origin}/cart`,
    };

    const response: any = yield call([userPaymentsApi, userPaymentsApi.createCheckout], checkoutRequest);
    if (response.success && response.data) {
      yield put(createCheckoutSuccess(response.data));
    } else {
      const message = response.message || "Failed to create checkout";
      yield put(createCheckoutFailure(message));
      yield put(addToast({ type: "error", message }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to create checkout");
    yield put(createCheckoutFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* getPaymentMethodsWorker(_action: GetPaymentMethodsAction): Generator {
  try {
    const response: any = yield call([userPaymentsApi, userPaymentsApi.getPaymentMethods]);
    if (response.success && response.data?.methods) {
      yield put(getPaymentMethodsSuccess(response.data.methods));
    } else {
      const message = response.message || "Failed to load payment methods";
      yield put(getPaymentMethodsFailure(message));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load payment methods");
    yield put(getPaymentMethodsFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* getPaymentStatusWorker(action: GetPaymentStatusAction): Generator {
  try {
    const orderId = action.payload;
    const response: any = yield call([userPaymentsApi, userPaymentsApi.getPaymentStatus], orderId);
    if (response.success && response.data?.payment) {
      yield put(getPaymentStatusSuccess(response.data.payment));
    } else {
      const message = response.message || "Failed to get payment status";
      yield put(getPaymentStatusFailure(message));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to get payment status");
    yield put(getPaymentStatusFailure(message));
  }
}

function* getPaymentHistoryWorker(action: GetPaymentHistoryAction): Generator {
  try {
    const query = action.payload;
    const response: any = yield call([userPaymentsApi, userPaymentsApi.getPaymentHistory], query);
    if (response.success && response.data) {
      yield put(getPaymentHistorySuccess(response.data));
    } else {
      const message = response.message || "Failed to load payment history";
      yield put(getPaymentHistoryFailure(message));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load payment history");
    yield put(getPaymentHistoryFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

export function* paymentSaga() {
  yield takeEvery(createCheckoutStart.type, createCheckoutWorker);
  yield takeEvery(getPaymentMethodsStart.type, getPaymentMethodsWorker);
  yield takeEvery(getPaymentStatusStart.type, getPaymentStatusWorker);
  yield takeEvery(getPaymentHistoryStart.type, getPaymentHistoryWorker);
}
