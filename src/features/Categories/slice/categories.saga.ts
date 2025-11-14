import { call, put, takeEvery } from "redux-saga/effects";
import { userCategoriesApi } from "@/core/api/categories";
import { userProductsApi } from "@/core/api/products";
import { addToast } from "@/app/store/slices/toast";
import type {
  fetchCategoriesStart,
  fetchCategoryDetailStart,
  fetchSubCategoriesStart,
  fetchCategoryProductsStart,
} from "./categories.slice";
import {
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchCategoryDetailSuccess,
  fetchCategoryDetailFailure,
  fetchSubCategoriesSuccess,
  fetchSubCategoriesFailure,
  fetchCategoryProductsSuccess,
  fetchCategoryProductsFailure,
} from "./categories.slice";
import type { ApiSuccess } from "@/core/api/categories/type";

type FetchCategoriesAction = ReturnType<typeof fetchCategoriesStart>;
type FetchCategoryDetailAction = ReturnType<typeof fetchCategoryDetailStart>;
type FetchSubCategoriesAction = ReturnType<typeof fetchSubCategoriesStart>;
type FetchCategoryProductsAction = ReturnType<typeof fetchCategoryProductsStart>;

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

// Categories list worker
function* fetchCategoriesWorker(
  action: FetchCategoriesAction
): Generator<unknown, void, ApiSuccess> {
  try {
    const { page = 1, limit = 10, isActive = true } = action.payload;

    const response = yield call([userCategoriesApi, userCategoriesApi.getCategories], {
      page,
      limit,
      isActive,
    });

    if (response.data) {
      // Backend returns categories array directly in data, pagination in meta
      const categories = Array.isArray(response.data)
        ? response.data
        : response.data.categories || [];
      yield put(
        fetchCategoriesSuccess({
          categories,
          pagination: response.meta ||
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            },
        })
      );
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, "Không thể tải danh sách danh mục");
    yield put(fetchCategoriesFailure(errorMessage));
    yield put(
      addToast({
        type: "error",
        message: errorMessage,
      })
    );
  }
}

// Category detail worker
function* fetchCategoryDetailWorker(
  action: FetchCategoryDetailAction
): Generator<unknown, void, ApiSuccess> {
  try {
    const { id } = action.payload;

    const response = yield call([userCategoriesApi, userCategoriesApi.getCategory], id);

    if (response.data) {
      yield put(fetchCategoryDetailSuccess(response.data));
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, "Không thể tải thông tin danh mục");
    yield put(fetchCategoryDetailFailure(errorMessage));
    yield put(
      addToast({
        type: "error",
        message: errorMessage,
      })
    );
  }
}

// Subcategories worker
function* fetchSubCategoriesWorker(
  action: FetchSubCategoriesAction
): Generator<unknown, void, ApiSuccess> {
  try {
    const { categoryId, page = 1, limit = 10 } = action.payload;

    const response = yield call(
      [userCategoriesApi, userCategoriesApi.getSubCategories],
      categoryId,
      {
        page,
        limit,
      }
    );

    if (response.data) {
      // Backend returns subCategories array directly in data, pagination in meta
      const subCategories = Array.isArray(response.data)
        ? response.data
        : response.data.subCategories || [];
      yield put(
        fetchSubCategoriesSuccess({
          subCategories,
          pagination: response.meta ||
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            },
        })
      );
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, "Không thể tải danh sách danh mục con");
    yield put(fetchSubCategoriesFailure(errorMessage));
    yield put(
      addToast({
        type: "error",
        message: errorMessage,
      })
    );
  }
}

// Category products worker
function* fetchCategoryProductsWorker(
  action: FetchCategoryProductsAction
): Generator<unknown, void, ApiSuccess> {
  try {
    const { categoryId, page = 1, limit = 12 } = action.payload;

    const response = yield call([userProductsApi, userProductsApi.getProducts], {
      categoryId,
      page,
      limit,
      isActive: true,
    });

    if (response.data) {
      yield put(
        fetchCategoryProductsSuccess({
          products: response.data.products || response.data || [],
          pagination: response.data.pagination ||
            response.meta || {
              page: 1,
              limit: 12,
              total: 0,
              totalPages: 0,
            },
        })
      );
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, "Không thể tải danh sách sản phẩm");
    yield put(fetchCategoryProductsFailure(errorMessage));
    yield put(
      addToast({
        type: "error",
        message: errorMessage,
      })
    );
  }
}

export function* categoriesSaga() {
  yield takeEvery("categories/fetchCategoriesStart", fetchCategoriesWorker);
  yield takeEvery("categories/fetchCategoryDetailStart", fetchCategoryDetailWorker);
  yield takeEvery("categories/fetchSubCategoriesStart", fetchSubCategoriesWorker);
  yield takeEvery("categories/fetchCategoryProductsStart", fetchCategoryProductsWorker);
}
