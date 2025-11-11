import { call, put, takeEvery } from "redux-saga/effects";
import { homeApi } from "@/core/api/home";
import { addToast } from "@/app/store/slices/toast";
import type {
  fetchBannerStart,
  fetchHomeCategoriesStart,
  fetchBestSellerProductsStart,
  fetchBestShopsStart,
  fetchFlashSaleProductsStart,
  fetchSearchSuggestionStart,
} from "./home.slice";
import {
  fetchBannerSuccess,
  fetchBannerFailure,
  fetchHomeCategoriesSuccess,
  fetchHomeCategoriesFailure,
  fetchBestSellerProductsSuccess,
  fetchBestSellerProductsFailure,
  fetchBestShopsSuccess,
  fetchBestShopsFailure,
  fetchFlashSaleProductsSuccess,
  fetchFlashSaleProductsFailure,
  fetchSearchSuggestionSuccess,
  fetchSearchSuggestionFailure,
} from "./home.slice";
import type { ApiSuccess } from "@/core/api/home/type";

type FetchBannerAction = ReturnType<typeof fetchBannerStart>;
type FetchHomeCategoriesAction = ReturnType<typeof fetchHomeCategoriesStart>;
type FetchBestSellerProductsAction = ReturnType<typeof fetchBestSellerProductsStart>;
type FetchBestShopsAction = ReturnType<typeof fetchBestShopsStart>;
type FetchFlashSaleProductsAction = ReturnType<typeof fetchFlashSaleProductsStart>;
type FetchSearchSuggestionAction = ReturnType<typeof fetchSearchSuggestionStart>;

// Helper function to extract error message from unknown error
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === "object") {
    const errorObj = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return errorObj?.response?.data?.message || errorObj?.message || defaultMessage;
  }
  return defaultMessage;
};

// Banner worker
function* fetchBannerWorker(_action: FetchBannerAction): Generator<unknown, void, ApiSuccess> {
  try {
    const response = yield call([homeApi, homeApi.getBanner]);

    if (response.data) {
      yield put(fetchBannerSuccess(response.data));
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, "Failed to fetch banner");
    yield put(fetchBannerFailure(errorMessage));
    yield put(
      addToast({
        type: "error",
        message: errorMessage,
      })
    );
  }
}

// Home Categories worker
function* fetchHomeCategoriesWorker(
  action: FetchHomeCategoriesAction
): Generator<unknown, void, ApiSuccess> {
  try {
    const { page = 1, limit = 10 } = action.payload;

    const response = yield call([homeApi, homeApi.getHomeCategories], {
      page,
      limit,
    });

    if (response.data) {
      yield put(
        fetchHomeCategoriesSuccess({
          categories: response.data.categories || [],
          pagination: response.data.pagination ||
            response.meta || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            },
        })
      );
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, "Failed to fetch home categories");
    yield put(fetchHomeCategoriesFailure(errorMessage));
    yield put(
      addToast({
        type: "error",
        message: errorMessage,
      })
    );
  }
}

// Best Seller Products worker
function* fetchBestSellerProductsWorker(
  action: FetchBestSellerProductsAction
): Generator<unknown, void, ApiSuccess> {
  try {
    const { page = 1, limit = 10 } = action.payload;

    const response = yield call([homeApi, homeApi.getBestSellerProducts], {
      page,
      limit,
    });

    if (response.data) {
      yield put(
        fetchBestSellerProductsSuccess({
          products: response.data.products || [],
          pagination: response.data.pagination ||
            response.meta || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            },
        })
      );
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, "Failed to fetch best seller products");
    yield put(fetchBestSellerProductsFailure(errorMessage));
    yield put(
      addToast({
        type: "error",
        message: errorMessage,
      })
    );
  }
}

// Best Shops worker
function* fetchBestShopsWorker(action: FetchBestShopsAction): Generator<unknown, void, ApiSuccess> {
  try {
    const { page = 1, limit = 10 } = action.payload;

    const response = yield call([homeApi, homeApi.getBestShops], {
      page,
      limit,
    });

    if (response.data) {
      yield put(
        fetchBestShopsSuccess({
          shops: response.data.shops || [],
          pagination: response.data.pagination ||
            response.meta || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            },
        })
      );
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, "Failed to fetch best shops");
    yield put(fetchBestShopsFailure(errorMessage));
    yield put(
      addToast({
        type: "error",
        message: errorMessage,
      })
    );
  }
}

// Flash Sale Products worker
function* fetchFlashSaleProductsWorker(
  action: FetchFlashSaleProductsAction
): Generator<unknown, void, ApiSuccess> {
  try {
    const { page = 1, limit = 10 } = action.payload;

    const response = yield call([homeApi, homeApi.getFlashSaleProducts], {
      page,
      limit,
    });

    if (response.data) {
      yield put(
        fetchFlashSaleProductsSuccess({
          products: response.data.products || [],
          pagination: response.data.pagination ||
            response.meta || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            },
        })
      );
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, "Failed to fetch flash sale products");
    yield put(fetchFlashSaleProductsFailure(errorMessage));
    yield put(
      addToast({
        type: "error",
        message: errorMessage,
      })
    );
  }
}

// Search Suggestion worker
function* fetchSearchSuggestionWorker(
  action: FetchSearchSuggestionAction
): Generator<unknown, void, ApiSuccess> {
  try {
    const { query, page = 1, limit = 10 } = action.payload;

    const response = yield call([homeApi, homeApi.getSearchSuggestions], {
      q: query,
      page,
      limit,
    });

    if (response.data) {
      yield put(
        fetchSearchSuggestionSuccess({
          products: response.data.products || [],
          pagination: response.data.pagination ||
            response.meta || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            },
        })
      );
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, "Failed to fetch search suggestions");
    yield put(fetchSearchSuggestionFailure(errorMessage));
    // Don't show toast for search suggestions as it's a background operation
  }
}

export function* homeSaga() {
  yield takeEvery("home/fetchBannerStart", fetchBannerWorker);
  yield takeEvery("home/fetchHomeCategoriesStart", fetchHomeCategoriesWorker);
  yield takeEvery("home/fetchBestSellerProductsStart", fetchBestSellerProductsWorker);
  yield takeEvery("home/fetchBestShopsStart", fetchBestShopsWorker);
  yield takeEvery("home/fetchFlashSaleProductsStart", fetchFlashSaleProductsWorker);
  yield takeEvery("home/fetchSearchSuggestionStart", fetchSearchSuggestionWorker);
}
