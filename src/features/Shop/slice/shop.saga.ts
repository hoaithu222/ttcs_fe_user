import { call, put, takeEvery, select } from "redux-saga/effects";
import { userShopsApi } from "@/core/api/shops";
import type { Shop } from "@/core/api/shops/type";
import { shopManagementApi } from "@/core/api/shop-management";
import type {
  CreateShopRequest,
  UpdateShopRequest,
  ShopProductsQuery,
  ShopOrdersQuery,
  UpdateOrderStatusRequest,
} from "@/core/api/shop-management/type";
import { addToast } from "@/app/store/slices/toast";
import type {
  fetchOwnShopStart,
  getShopInfoStart,
  createShopStart,
  updateShopStart,
  getProductsStart,
  getOrdersStart,
  updateOrderStatusStart,
  createProductStart,
  deleteProductStart,
} from "./shop.slice";
import {
  fetchOwnShopSuccess,
  fetchOwnShopFailure,
  fetchShopStatusByUserStart,
  fetchShopStatusByUserSuccess,
  fetchShopStatusByUserFailure,
  getShopInfoSuccess,
  getShopInfoFailure,
  createShopSuccess,
  createShopFailure,
  updateShopSuccess,
  updateShopFailure,
  getProductsSuccess,
  getProductsFailure,
  getOrdersSuccess,
  getOrdersFailure,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
  createProductSuccess,
  createProductFailure,
  deleteProductSuccess,
  deleteProductFailure,
} from "./shop.slice";

type FetchOwnShopAction = ReturnType<typeof fetchOwnShopStart>;
type FetchShopStatusByUserAction = ReturnType<typeof fetchShopStatusByUserStart>;
type GetShopInfoAction = ReturnType<typeof getShopInfoStart>;
type CreateShopAction = ReturnType<typeof createShopStart>;
type UpdateShopAction = ReturnType<typeof updateShopStart>;
type GetProductsAction = ReturnType<typeof getProductsStart>;
type GetOrdersAction = ReturnType<typeof getOrdersStart>;
type UpdateOrderStatusAction = ReturnType<typeof updateOrderStatusStart>;
type CreateProductAction = ReturnType<typeof createProductStart>;
type DeleteProductAction = ReturnType<typeof deleteProductStart>;

// Helper function để lấy error message
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e?.response?.data?.message || e?.message || fallback;
  }
  return fallback;
};

// Workers
function* fetchOwnShopWorker(action: FetchOwnShopAction): Generator {
  try {
    const { userId, page = 1, limit = 1 } = action.payload || ({} as any);
    const response: any = yield call([userShopsApi, userShopsApi.getShops], {
      userId,
      page,
      limit,
    } as any);
    const items = response?.data?.shops || response?.data?.items || [];
    const shop: Shop | null = Array.isArray(items) && items.length ? (items[0] as Shop) : null;

    yield put(fetchOwnShopSuccess({ shop }));
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load shop information");
    yield put(fetchOwnShopFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* fetchShopStatusByUserWorker(action: FetchShopStatusByUserAction): Generator {
  try {
    const { userId } = action.payload;
    const response: any = yield call([userShopsApi, userShopsApi.getShopStatusByUserId], userId);
    const data = response?.data || response;
    if (data) {
      yield put(fetchShopStatusByUserSuccess(data));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load shop status");
    yield put(fetchShopStatusByUserFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* getShopInfoWorker(_action: GetShopInfoAction): Generator {
  try {
    const response: any = yield call([shopManagementApi, shopManagementApi.getShopInfo]);
    const shop = response?.data || response?.data?.shop;
    if (shop) {
      yield put(getShopInfoSuccess(shop));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load shop info");
    yield put(getShopInfoFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* createShopWorker(action: CreateShopAction): Generator {
  try {
    const response: any = yield call(
      [shopManagementApi, shopManagementApi.createShop],
      action.payload
    );
    const shop = response?.data || response?.data?.shop;

    if (shop) {
      yield put(createShopSuccess(shop));
      yield put(
        addToast({
          type: "success",
          message: "Đăng ký cửa hàng thành công. Hồ sơ đang chờ xét duyệt.",
        })
      );

      // Fetch lại shop status sau khi create thành công
      const state: any = yield select((rootState: any) => rootState);
      const userId = state?.profile?.data?._id || state?.auth?.user?._id;
      if (userId) {
        yield put(fetchShopStatusByUserStart({ userId }));
      }
    } else {
      const errorMessage = "Không nhận được dữ liệu shop từ server";
      yield put(createShopFailure(errorMessage));
      yield put(addToast({ type: "error", message: errorMessage }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to create shop");
    yield put(createShopFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* updateShopWorker(action: UpdateShopAction): Generator {
  try {
    const response: any = yield call(
      [shopManagementApi, shopManagementApi.updateShop],
      action.payload
    );
    const shop = response?.data || response?.data?.shop;
    if (shop) {
      yield put(updateShopSuccess(shop));
      yield put(getShopInfoStart()); // Refresh shop info
      yield put(addToast({ type: "success", message: "Cập nhật cửa hàng thành công" }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to update shop");
    yield put(updateShopFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* getProductsWorker(action: GetProductsAction): Generator {
  try {
    const { page = 1, limit = 10 } = action.payload || {};
    const response: any = yield call(
      [shopManagementApi, shopManagementApi.getProducts],
      action.payload
    );
    const data = response?.data || response;
    if (data) {
      yield put(
        getProductsSuccess({
          products: data.products || [],
          pagination: data.pagination || { page, limit, total: 0, totalPages: 0 },
        })
      );
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load products");
    yield put(getProductsFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* getOrdersWorker(action: GetOrdersAction): Generator {
  try {
    const { page = 1, limit = 10 } = action.payload || {};
    const response: any = yield call(
      [shopManagementApi, shopManagementApi.getOrders],
      action.payload
    );
    const data = response?.data || response;
    if (data) {
      yield put(
        getOrdersSuccess({
          orders: data.orders || [],
          pagination: data.pagination || { page, limit, total: 0, totalPages: 0 },
        })
      );
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load orders");
    yield put(getOrdersFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* updateOrderStatusWorker(action: UpdateOrderStatusAction): Generator {
  try {
    const { orderId, data } = action.payload;
    yield call([shopManagementApi, shopManagementApi.updateOrderStatus], orderId, data);
    yield put(updateOrderStatusSuccess());
    yield put(addToast({ type: "success", message: "Cập nhật trạng thái đơn hàng thành công" }));
    
    // Refresh orders list
    const state: any = yield select((rootState: any) => rootState);
    const currentPage = state?.shop?.orders?.pagination?.page || 1;
    yield put(getOrdersStart({ page: currentPage, limit: 10 }));
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to update order status");
    yield put(updateOrderStatusFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* createProductWorker(action: CreateProductAction): Generator {
  try {
    const response: any = yield call(
      [shopManagementApi, shopManagementApi.createProduct],
      action.payload
    );
    const product = response?.data || response?.data?.product;
    if (product) {
      yield put(createProductSuccess(product));
      yield put(addToast({ type: "success", message: "Tạo sản phẩm thành công" }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to create product");
    yield put(createProductFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* deleteProductWorker(action: DeleteProductAction): Generator {
  try {
    const { productId } = action.payload;
    yield call([shopManagementApi, shopManagementApi.deleteProduct], productId);
    yield put(deleteProductSuccess({ productId }));
    yield put(addToast({ type: "success", message: "Xóa sản phẩm thành công" }));
    
    // Refresh products list
    const state: any = yield select((rootState: any) => rootState);
    const currentPage = state?.shop?.products?.pagination?.page || 1;
    yield put(getProductsStart({ page: currentPage, limit: 12 }));
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to delete product");
    yield put(deleteProductFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

// Root watcher for Shop feature
export function* shopSaga() {
  yield takeEvery("shop/fetchOwnShopStart", fetchOwnShopWorker);
  yield takeEvery("shop/fetchShopStatusByUserStart", fetchShopStatusByUserWorker);
  yield takeEvery("shop/getShopInfoStart", getShopInfoWorker);
  yield takeEvery("shop/createShopStart", createShopWorker);
  yield takeEvery("shop/updateShopStart", updateShopWorker);
  yield takeEvery("shop/getProductsStart", getProductsWorker);
  yield takeEvery("shop/getOrdersStart", getOrdersWorker);
  yield takeEvery("shop/updateOrderStatusStart", updateOrderStatusWorker);
  yield takeEvery("shop/createProductStart", createProductWorker);
  yield takeEvery("shop/deleteProductStart", deleteProductWorker);
}
