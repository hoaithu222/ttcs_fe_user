import { call, put, takeEvery } from "redux-saga/effects";
import { ProductService } from "@/features/Products/api";
import { addToast } from "@/app/store/slices/toast";
import type {
  getProductsStart,
  getProductDetailStart,
  getRelatedProductsStart,
  getProductReviewsStart,
  getProductShopStart,
} from "./product.slice";
import {
  getProductsSuccess,
  getProductsFailure,
  getProductDetailSuccess,
  getProductDetailFailure,
  getRelatedProductsSuccess,
  getRelatedProductsFailure,
  getProductReviewsSuccess,
  getProductReviewsFailure,
  getProductShopSuccess,
  getProductShopFailure,
} from "./product.slice";

type GetProductsAction = ReturnType<typeof getProductsStart>;
type GetProductDetailAction = ReturnType<typeof getProductDetailStart>;
type GetRelatedProductsAction = ReturnType<typeof getRelatedProductsStart>;
type GetProductReviewsAction = ReturnType<typeof getProductReviewsStart>;
type GetProductShopAction = ReturnType<typeof getProductShopStart>;

// Helper function để lấy error message
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e?.response?.data?.message || e?.message || fallback;
  }
  return fallback;
};

// Get products list
function* getProductsWorker(action: GetProductsAction): Generator {
  try {
    const response: any = yield call([ProductService, ProductService.getProducts], action.payload);
    if (response.success && response.data) {
      yield put(getProductsSuccess(response.data.products || []));
    } else {
      yield put(getProductsFailure(response.message || "Failed to load products"));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load products");
    yield put(getProductsFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

// Get product detail
function* getProductDetailWorker(action: GetProductDetailAction): Generator {
  try {
    const response: any = yield call([ProductService, ProductService.getProduct], action.payload);
    if (response.success && response.data) {
      const product = response.data.product || response.data;
      yield put(getProductDetailSuccess(product));

      // Track product view
      yield call([ProductService, ProductService.trackProductView], action.payload);
    } else {
      yield put(getProductDetailFailure(response.message || "Failed to load product"));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load product");
    yield put(getProductDetailFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

// Get related products
function* getRelatedProductsWorker(action: GetRelatedProductsAction): Generator {
  try {
    const response: any = yield call(
      [ProductService, ProductService.getRelatedProducts],
      action.payload
    );
    if (response.success && response.data) {
      yield put(getRelatedProductsSuccess(response.data || []));
    } else {
      yield put(getRelatedProductsFailure(response.message || "Failed to load related products"));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load related products");
    yield put(getRelatedProductsFailure(message));
  }
}

// Get product reviews
function* getProductReviewsWorker(action: GetProductReviewsAction): Generator {
  try {
    const { productId, page = 1, limit = 10 } = action.payload;
    const response: any = yield call(
      [ProductService, ProductService.getProductReviews],
      productId,
      page,
      limit
    );
    if (response.success && response.data) {
      yield put(getProductReviewsSuccess(response.data.reviews || []));
    } else {
      yield put(getProductReviewsFailure(response.message || "Failed to load reviews"));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load reviews");
    yield put(getProductReviewsFailure(message));
  }
}

// Get product shop
function* getProductShopWorker(_action: GetProductShopAction): Generator {
  try {
    // TODO: Implement shop API call
    // For now, we'll get shop info from product data
    yield put(getProductShopSuccess({} as any));
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load shop info");
    yield put(getProductShopFailure(message));
  }
}

// Root watcher for Product feature
export function* productSaga() {
  yield takeEvery("product/getProductsStart", getProductsWorker);
  yield takeEvery("product/getProductDetailStart", getProductDetailWorker);
  yield takeEvery("product/getRelatedProductsStart", getRelatedProductsWorker);
  yield takeEvery("product/getProductReviewsStart", getProductReviewsWorker);
  yield takeEvery("product/getProductShopStart", getProductShopWorker);
}

export default productSaga;
