import { call, put, takeEvery } from "redux-saga/effects";
import { CartService } from "../api";
import { addToast } from "@/app/store/slices/toast";
import {
  getCartStart,
  getCartSuccess,
  getCartFailure,
  addToCartStart,
  addToCartSuccess,
  addToCartFailure,
  removeFromCartStart,
  removeFromCartSuccess,
  removeFromCartFailure,
  updateQuantityStart,
  updateQuantitySuccess,
  updateQuantityFailure,
  clearCartStart,
  clearCartSuccess,
  clearCartFailure,
} from "./Cart.slice";

// Helper function để lấy error message
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e?.response?.data?.message || e?.message || fallback;
  }
  return fallback;
};

type GetCartAction = ReturnType<typeof getCartStart>;
type AddToCartAction = ReturnType<typeof addToCartStart>;
type RemoveFromCartAction = ReturnType<typeof removeFromCartStart>;
type UpdateQuantityAction = ReturnType<typeof updateQuantityStart>;
type ClearCartAction = ReturnType<typeof clearCartStart>;

function* getCartWorker(_action: GetCartAction): Generator {
  try {
    const response: any = yield call([CartService, CartService.getCart]);
    if (response.success && response.data?.cart) {
      yield put(getCartSuccess(response.data.cart));
    } else {
      yield put(getCartFailure(response.message || "Failed to load cart"));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load cart");
    yield put(getCartFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* addToCartWorker(action: AddToCartAction): Generator {
  try {
    const response: any = yield call([CartService, CartService.addItem], action.payload);
    if (response.success && response.data?.cart) {
      yield put(addToCartSuccess(response.data.cart));
      yield put(addToast({ type: "success", message: "Đã thêm sản phẩm vào giỏ hàng" }));
    } else {
      yield put(addToCartFailure(response.message || "Failed to add item to cart"));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to add item to cart");
    yield put(addToCartFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* removeFromCartWorker(action: RemoveFromCartAction): Generator {
  try {
    const response: any = yield call([CartService, CartService.removeItem], action.payload);
    if (response.success && response.data?.cart) {
      yield put(removeFromCartSuccess(response.data.cart));
      yield put(addToast({ type: "success", message: "Đã xóa sản phẩm khỏi giỏ hàng" }));
    } else {
      yield put(removeFromCartFailure(response.message || "Failed to remove item from cart"));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to remove item from cart");
    yield put(removeFromCartFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* updateQuantityWorker(action: UpdateQuantityAction): Generator {
  try {
    const { itemId, quantity, variantId, priceAtTime } = action.payload;
    const updatePayload: any = {};
    if (typeof quantity === "number") updatePayload.quantity = quantity;
    if (variantId) updatePayload.variantId = variantId;
    if (typeof priceAtTime === "number") updatePayload.priceAtTime = priceAtTime;

    if (Object.keys(updatePayload).length === 0) {
      return;
    }

    const response: any = yield call([CartService, CartService.updateItem], itemId, updatePayload);
    if (response.success && response.data?.cart) {
      yield put(updateQuantitySuccess(response.data.cart));
    } else {
      yield put(updateQuantityFailure(response.message || "Failed to update quantity"));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to update quantity");
    yield put(updateQuantityFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* clearCartWorker(_action: ClearCartAction): Generator {
  try {
    const response: any = yield call([CartService, CartService.clearCart]);
    if (response.success) {
      yield put(clearCartSuccess({} as any));
      yield put(addToast({ type: "success", message: "Đã xóa toàn bộ giỏ hàng" }));
      // Reload cart to get empty cart
      yield put(getCartStart());
    } else {
      yield put(clearCartFailure(response.message || "Failed to clear cart"));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to clear cart");
    yield put(clearCartFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

export function* cartSaga() {
  yield takeEvery(getCartStart.type, getCartWorker);
  yield takeEvery(addToCartStart.type, addToCartWorker);
  yield takeEvery(removeFromCartStart.type, removeFromCartWorker);
  yield takeEvery(updateQuantityStart.type, updateQuantityWorker);
  yield takeEvery(clearCartStart.type, clearCartWorker);
}
