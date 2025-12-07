import { call, put, takeEvery, select } from "redux-saga/effects";
import { imagesApi } from "@/core/api/images";
import { ProductService, ShopService, OrderService } from "@/features/Shop/api";
import { addToast } from "@/app/store/slices/toast";
import type {
  fetchOwnShopStart,
  createShopStart,
  updateShopStart,
  updateOrderStatusStart,
  createProductStart,
  deleteProductStart,
} from "./shop.slice";
import { getShopInfoStart, getProductsStart, getOrdersStart } from "./shop.slice";
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

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Helper function để lấy error message
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e?.response?.data?.message || e?.message || fallback;
  }
  return fallback;
};

const isObjectId = (value: string): boolean => objectIdRegex.test(value);

function* resolveImageReference(image: any): Generator<any, string | undefined, any> {
  if (!image) {
    return undefined;
  }

  if (typeof image === "string") {
    if (isObjectId(image)) {
      return image;
    }
    return undefined;
  }

  if (typeof image === "object") {
    if (typeof image._id === "string" && isObjectId(image._id)) {
      return image._id;
    }

    if (typeof image.url === "string" && isObjectId(image.url)) {
      return image.url;
    }

    if (image.url && image.publicId) {
      try {
        const response: any = yield call([imagesApi, imagesApi.createImage], {
          url: image.url,
          publicId: image.publicId,
        });
        return response?.data?._id;
      } catch (error) {
        console.error("Failed to persist image reference:", error);
        return undefined;
      }
    }
  }

  return undefined;
}

// Workers
function* fetchOwnShopWorker(action: FetchOwnShopAction): Generator {
  try {
    const { userId, page = 1, limit = 1 } = action.payload || ({} as any);
    const response: any = yield call([ShopService, ShopService.getOwnShop], userId, page, limit);

    if (response.success) {
      yield put(fetchOwnShopSuccess({ shop: response.data }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load shop information");
    yield put(fetchOwnShopFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* fetchShopStatusByUserWorker(action: FetchShopStatusByUserAction): Generator {
  try {
    const { userId } = action.payload;
    const response: any = yield call([ShopService, ShopService.getShopStatusByUserId], userId);
    if (response.success && response.data) {
      yield put(fetchShopStatusByUserSuccess(response.data));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load shop status");
    yield put(fetchShopStatusByUserFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* getShopInfoWorker(_action: GetShopInfoAction): Generator {
  try {
    const response: any = yield call([ShopService, ShopService.getShopInfo]);
    if (response.success && response.data) {
      yield put(getShopInfoSuccess(response.data));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load shop info");
    yield put(getShopInfoFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* createShopWorker(action: CreateShopAction): Generator {
  try {
    const response: any = yield call([ShopService, ShopService.createShop], action.payload);

    if (response.success && response.data) {
      yield put(createShopSuccess(response.data));
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
    const response: any = yield call([ShopService, ShopService.updateShop], action.payload);
    if (response.success && response.data) {
      yield put(updateShopSuccess(response.data));
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
    const response: any = yield call([ProductService, ProductService.getProducts], action.payload);

    if (response.success && response.data) {
      yield put(
        getProductsSuccess({
          products: response.data,
          pagination: response.meta || {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
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
    const response: any = yield call([OrderService, OrderService.getOrders], action.payload);

    if (response.success && response.data) {
      // Normalize orders to ensure orderNumber is always present
      const normalizedOrders = response.data.map((order: any) => {
        // Derive orderNumber with fallback logic
        let orderNumber = order.orderNumber;
        if (!orderNumber) {
          // Try orderCode as fallback
          orderNumber = order.orderCode;
        }
        if (!orderNumber && order._id) {
          // Generate from _id as last resort
          orderNumber = `#${String(order._id).slice(-6).toUpperCase()}`;
        }
        if (!orderNumber) {
          orderNumber = "#UNKNOWN";
        }

        return {
          ...order,
          orderNumber,
        };
      });

      yield put(
        getOrdersSuccess({
          orders: normalizedOrders,
          pagination: response.meta || {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
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
    yield call([OrderService, OrderService.updateOrderStatus], orderId, data);
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
    const payload = action.payload;
    let productData = { ...payload };

    if (payload.images && Array.isArray(payload.images)) {
      const resolvedImageIds: string[] = [];
      for (const imageItem of payload.images) {
        const imageId: string | undefined = yield* resolveImageReference(imageItem);
        if (imageId) {
          resolvedImageIds.push(imageId);
        }
      }

      if (resolvedImageIds.length > 0) {
        productData.images = resolvedImageIds;
      }
    }

    if (productData.variants && Array.isArray(productData.variants)) {
      for (const variant of productData.variants) {
        const resolvedVariantImage: string | undefined = yield* resolveImageReference(
          variant.image
        );
        if (resolvedVariantImage) {
          variant.image = resolvedVariantImage;
        } else if (typeof variant.image === "object" && variant.image?.url) {
          variant.image = variant.image.url;
        }
      }
    }

    const response: any = yield call([ProductService, ProductService.createProduct], productData);
    if (response.success && response.data) {
      yield put(createProductSuccess(response.data));
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
    yield call([ProductService, ProductService.deleteProduct], productId);
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
