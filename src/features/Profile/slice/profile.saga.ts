import { call, put, takeEvery } from "redux-saga/effects";
import { addToast } from "@/app/store/slices/toast";
import { authAPI } from "@/core/api/auth";
import { userCartApi } from "@/core/api/cart";
import { userOrdersApi } from "@/core/api/orders";
import { userAddressesApi } from "@/core/api/addresses";
import { userWishlistApi } from "@/core/api/wishlist";
import { userShopsApi } from "@/core/api/shops";
import type {
  fetchProfileStart,
  fetchCartStart,
  fetchOrdersStart,
  fetchAddressesStart,
  createAddressStart,
  updateAddressStart,
  deleteAddressStart,
  setDefaultAddressStart,
  fetchWishlistStart,
  checkShopFollowingStart,
} from "./profile.slice";
import {
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  fetchCartSuccess,
  fetchCartFailure,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchAddressesSuccess,
  fetchAddressesFailure,
  createAddressSuccess,
  createAddressFailure,
  updateAddressSuccess,
  updateAddressFailure,
  deleteAddressSuccess,
  deleteAddressFailure,
  setDefaultAddressSuccess,
  setDefaultAddressFailure,
  fetchWishlistSuccess,
  fetchWishlistFailure,
  checkShopFollowingSuccess,
  checkShopFollowingFailure,
} from "./profile.slice";

// types from apis
import type { ApiSuccess as OrdersApiSuccess } from "@/core/api/orders/type";
import type { ApiSuccess as AddressesApiSuccess } from "@/core/api/addresses/type";
import type { ApiSuccess as CartApiSuccess } from "@/core/api/cart/type";
import type { ApiSuccess as AuthApiSuccess, User } from "@/core/api/auth/type";
import type { ApiSuccess as WishlistApiSuccess, WishlistResponse } from "@/core/api/wishlist/type";
import type { ApiSuccess as ShopsApiSuccess, FollowStatusResponse } from "@/core/api/shops/type";

type FetchProfileAction = ReturnType<typeof fetchProfileStart>;
type FetchCartAction = ReturnType<typeof fetchCartStart>;
type FetchOrdersAction = ReturnType<typeof fetchOrdersStart>;
type FetchAddressesAction = ReturnType<typeof fetchAddressesStart>;
type CreateAddressAction = ReturnType<typeof createAddressStart>;
type UpdateAddressAction = ReturnType<typeof updateAddressStart>;
type DeleteAddressAction = ReturnType<typeof deleteAddressStart>;
type SetDefaultAddressAction = ReturnType<typeof setDefaultAddressStart>;
type UpdateProfileAction = ReturnType<typeof updateProfileStart>;
type FetchWishlistAction = ReturnType<typeof fetchWishlistStart>;
type CheckShopFollowingAction = ReturnType<typeof checkShopFollowingStart>;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e?.response?.data?.message || e?.message || fallback;
  }
  return fallback;
};

function* fetchProfileWorker(
  _action: FetchProfileAction
): Generator<unknown, void, AuthApiSuccess<User>> {
  try {
    const response = yield call([authAPI, authAPI.getProfile]);
    if (response.data) {
      yield put(fetchProfileSuccess(response.data));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to fetch profile");
    yield put(fetchProfileFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* fetchCartWorker(_action: FetchCartAction): Generator<unknown, void, CartApiSuccess> {
  try {
    const response = yield call([userCartApi, userCartApi.getCart]);
    if (response.data) {
      yield put(
        fetchCartSuccess({
          carts: response.data.cart ? [response.data.cart] : [],
          pagination: response.meta || { page: 1, limit: 10, total: 1, totalPages: 1 },
        })
      );
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to fetch cart");
    yield put(fetchCartFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* fetchOrdersWorker(action: FetchOrdersAction): Generator<unknown, void, OrdersApiSuccess> {
  try {
    const { page = 1, limit = 10 } = action.payload || {};
    const response = yield call([userOrdersApi, userOrdersApi.getOrders], { page, limit });
    const rawData = response.data;
    const defaultPagination =
      response.meta || { page, limit, total: 0, totalPages: 0 };

    let orders: any[] = [];
    let pagination = defaultPagination;

    if (Array.isArray(rawData)) {
      orders = rawData;
    } else if (rawData?.orders) {
      orders = rawData.orders;
      pagination = rawData.pagination || defaultPagination;
    } else if (rawData) {
      orders = [rawData];
    }

    yield put(
      fetchOrdersSuccess({
        orders,
        pagination,
      })
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to fetch orders");
    yield put(fetchOrdersFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* fetchAddressesWorker(
  _action: FetchAddressesAction
): Generator<unknown, void, AddressesApiSuccess> {
  try {
    const response = yield call([userAddressesApi, userAddressesApi.getAddresses]);
    if (response.data) {
      const addresses = response.data.addresses || response.data || [];
      const defaultAddress = Array.isArray(addresses)
        ? addresses.find((a: any) => a.isDefault)
        : null;
      yield put(
        fetchAddressesSuccess({
          addresses: Array.isArray(addresses) ? addresses : [],
          defaultAddress: defaultAddress || null,
          pagination: response.meta || {
            page: 1,
            limit: 10,
            total: addresses.length || 0,
            totalPages: 1,
          },
        })
      );
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to fetch addresses");
    yield put(fetchAddressesFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* createAddressWorker(
  action: CreateAddressAction
): Generator<unknown, void, AddressesApiSuccess> {
  try {
    const response = yield call([userAddressesApi, userAddressesApi.createAddress], action.payload);
    if (response.data) {
      // Reload danh sách địa chỉ để đồng bộ với backend (đặc biệt khi địa chỉ mới là mặc định)
      const addressesResponse = yield call([userAddressesApi, userAddressesApi.getAddresses]);
      if (addressesResponse.data) {
        const addresses = addressesResponse.data.addresses || addressesResponse.data || [];
        const defaultAddress = Array.isArray(addresses)
          ? addresses.find((a: any) => a.isDefault)
          : null;
        yield put(
          fetchAddressesSuccess({
            addresses: Array.isArray(addresses) ? addresses : [],
            defaultAddress: defaultAddress || null,
            pagination: addressesResponse.meta || {
              page: 1,
              limit: 10,
              total: addresses.length || 0,
              totalPages: 1,
            },
          })
        );
      }
      // Đánh dấu create address thành công (không thêm địa chỉ vào state vì đã reload rồi)
      yield put(createAddressSuccess(response.data));
      yield put(addToast({ type: "success", message: response.message || "Đã thêm địa chỉ thành công" }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to create address");
    yield put(createAddressFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* updateAddressWorker(
  action: UpdateAddressAction
): Generator<unknown, void, AddressesApiSuccess> {
  try {
    const { id, data } = action.payload;
    const response = yield call([userAddressesApi, userAddressesApi.updateAddress], id, data);
    if (response.data) {
      // Reload danh sách địa chỉ để đồng bộ với backend (đặc biệt khi địa chỉ được update là mặc định)
      const addressesResponse = yield call([userAddressesApi, userAddressesApi.getAddresses]);
      if (addressesResponse.data) {
        const addresses = addressesResponse.data.addresses || addressesResponse.data || [];
        const defaultAddress = Array.isArray(addresses)
          ? addresses.find((a: any) => a.isDefault)
          : null;
        yield put(
          fetchAddressesSuccess({
            addresses: Array.isArray(addresses) ? addresses : [],
            defaultAddress: defaultAddress || null,
            pagination: addressesResponse.meta || {
              page: 1,
              limit: 10,
              total: addresses.length || 0,
              totalPages: 1,
            },
          })
        );
      }
      yield put(updateAddressSuccess(response.data));
      yield put(addToast({ type: "success", message: response.message || "Đã cập nhật địa chỉ thành công" }));
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to update address");
    yield put(updateAddressFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* deleteAddressWorker(
  action: DeleteAddressAction
): Generator<unknown, void, AddressesApiSuccess> {
  try {
    const { id } = action.payload;
    yield call([userAddressesApi, userAddressesApi.deleteAddress], id);
    yield put(deleteAddressSuccess(id));
    yield put(addToast({ type: "success", message: "Address deleted" }));
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to delete address");
    yield put(deleteAddressFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* setDefaultAddressWorker(
  action: SetDefaultAddressAction
): Generator<unknown, void, AddressesApiSuccess> {
  try {
    const { id } = action.payload;
    const response = yield call([userAddressesApi, userAddressesApi.setDefaultAddress], id);
    if (response.data) {
      // Backend trả về mảng items, cần xử lý như fetchAddressesSuccess
      const addresses = Array.isArray(response.data) ? response.data : [];
      const defaultAddress = addresses.find((a: any) => a.isDefault) || null;
      yield put(
        fetchAddressesSuccess({
          addresses,
          defaultAddress,
          pagination: response.meta || {
            page: 1,
            limit: 10,
            total: addresses.length || 0,
            totalPages: 1,
          },
        })
      );
      yield put(
        addToast({ type: "success", message: response.message || "Đã đặt địa chỉ mặc định thành công" })
      );
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to set default address");
    yield put(setDefaultAddressFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* updateProfileWorker(
  action: UpdateProfileAction
): Generator<unknown, void, AuthApiSuccess<User>> {
  try {
    const response = yield call([authAPI, authAPI.updateProfile], action.payload as Partial<User>);
    if (response.data) {
      yield put(updateProfileSuccess(response.data));
      yield put(
        addToast({ type: "success", message: response.message || "Cập nhật hồ sơ thành công" })
      );
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to update profile");
    yield put(updateProfileFailure(message));
    yield put(addToast({ type: "error", message }));
  }
}

function* fetchWishlistWorker(
  _action: FetchWishlistAction
): Generator<unknown, void, WishlistApiSuccess<WishlistResponse>> {
  try {
    const response = yield call([userWishlistApi, userWishlistApi.getWishlist]);
    if (response.data?.wishlist) {
      const wishlist = response.data.wishlist;
      yield put(
        fetchWishlistSuccess({
          items: wishlist.items || [],
          pagination: {
            page: 1,
            limit: 10,
            total: wishlist.itemCount || wishlist.items?.length || 0,
            totalPages: 1,
          },
        })
      );
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to fetch wishlist");
    yield put(fetchWishlistFailure(message));
    // Don't show toast for wishlist fetch errors (silent fail)
  }
}

function* checkShopFollowingWorker(
  action: CheckShopFollowingAction
): Generator<unknown, void, ShopsApiSuccess<FollowStatusResponse>> {
  try {
    const { shopId } = action.payload;
    const response = yield call([userShopsApi, userShopsApi.getFollowingStatus], shopId);
    if (response.data) {
      yield put(
        checkShopFollowingSuccess({
          shopId,
          isFollowing: response.data.isFollowing || false,
          followersCount: response.data.followersCount || 0,
        })
      );
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to check shop following status");
    yield put(checkShopFollowingFailure(message));
    // Don't show toast for check errors (silent fail)
  }
}

export function* profileSaga() {
  yield takeEvery("profile/fetchProfileStart", fetchProfileWorker);
  yield takeEvery("profile/updateProfileStart", updateProfileWorker);
  yield takeEvery("profile/fetchCartStart", fetchCartWorker);
  yield takeEvery("profile/fetchOrdersStart", fetchOrdersWorker);
  yield takeEvery("profile/fetchAddressesStart", fetchAddressesWorker);
  yield takeEvery("profile/createAddressStart", createAddressWorker);
  yield takeEvery("profile/updateAddressStart", updateAddressWorker);
  yield takeEvery("profile/deleteAddressStart", deleteAddressWorker);
  yield takeEvery("profile/setDefaultAddressStart", setDefaultAddressWorker);
  yield takeEvery("profile/fetchWishlistStart", fetchWishlistWorker);
  yield takeEvery("profile/checkShopFollowingStart", checkShopFollowingWorker);
}
