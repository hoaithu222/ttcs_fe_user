import { PayloadAction } from "@reduxjs/toolkit";
import { createResettableSlice } from "@/app/store/create-resettabable-slice";
import { IProfileState } from "./profile.types";
import { ReduxStateType } from "@/app/store/types";
import type { User } from "@/core/api/auth/type";
import type { Cart } from "@/core/api/cart/type";
import type { Order } from "@/core/api/orders/type";
import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@/core/api/addresses/type";
import type { WishlistItem } from "@/core/api/wishlist/type";

const initialState: IProfileState = {
  profile: {
    data: {} as User,
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  cart: {
    data: [],
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  orders: {
    data: [],
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    lastQuery: {
      page: 1,
      limit: 10,
    },
  },
  address: {
    data: [],
    status: ReduxStateType.INIT,
    defaultAddress: null,
    createAddress: {
      status: ReduxStateType.INIT,
      error: null,
      message: null,
    },
    updateAddress: {
      status: ReduxStateType.INIT,
      error: null,
      message: null,
    },
    deleteAddress: {
      status: ReduxStateType.INIT,
      error: null,
      message: null,
    },
    error: null,
    message: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  wishlist: {
    data: [],
    status: ReduxStateType.INIT,
    error: null,
    message: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  shopFollowing: {
    data: {},
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
};

const { slice: profileSlice, reducer: profileReducer } = createResettableSlice({
  name: "profile",
  initialState,
  reducers: {
    // Profile
    fetchProfileStart: (state) => {
      state.profile.status = ReduxStateType.LOADING;
      state.profile.error = null;
      state.profile.message = null;
    },
    fetchProfileSuccess: (state, action: PayloadAction<User>) => {
      state.profile.status = ReduxStateType.SUCCESS;
      state.profile.data = action.payload;
      state.profile.error = null;
      state.profile.message = null;
    },
    fetchProfileFailure: (state, action: PayloadAction<string>) => {
      state.profile.status = ReduxStateType.ERROR;
      state.profile.error = action.payload;
      state.profile.message = action.payload;
      state.profile.data = {} as User;
    },

    // Update Profile
    updateProfileStart: (state, _action: PayloadAction<Partial<User>>) => {
      state.profile.status = ReduxStateType.LOADING;
      state.profile.error = null;
      state.profile.message = null;
    },
    updateProfileSuccess: (state, action: PayloadAction<User>) => {
      state.profile.status = ReduxStateType.SUCCESS;
      state.profile.data = action.payload;
      state.profile.error = null;
      state.profile.message = null;
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.profile.status = ReduxStateType.ERROR;
      state.profile.error = action.payload;
      state.profile.message = action.payload;
    },

    // Cart (mapped to current cart; stored as array by spec)
    fetchCartStart: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      state.cart.status = ReduxStateType.LOADING;
      state.cart.error = null;
      state.cart.message = null;
      if (action.payload.page) state.cart.pagination.page = action.payload.page;
      if (action.payload.limit) state.cart.pagination.limit = action.payload.limit;
    },
    fetchCartSuccess: (
      state,
      action: PayloadAction<{
        carts: Cart[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>
    ) => {
      state.cart.status = ReduxStateType.SUCCESS;
      state.cart.data = action.payload.carts;
      state.cart.pagination = action.payload.pagination;
      state.cart.error = null;
      state.cart.message = null;
    },
    fetchCartFailure: (state, action: PayloadAction<string>) => {
      state.cart.status = ReduxStateType.ERROR;
      state.cart.error = action.payload;
      state.cart.message = action.payload;
      state.cart.data = [];
    },

    // Orders
    fetchOrdersStart: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      state.orders.status = ReduxStateType.LOADING;
      state.orders.error = null;
      state.orders.message = null;
      state.orders.lastQuery = {
        ...state.orders.lastQuery,
        ...action.payload,
      };
      if (action.payload.page) state.orders.pagination.page = action.payload.page;
      if (action.payload.limit) state.orders.pagination.limit = action.payload.limit;
    },
    fetchOrdersSuccess: (
      state,
      action: PayloadAction<{
        orders: Order[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>
    ) => {
      state.orders.status = ReduxStateType.SUCCESS;
      state.orders.data = action.payload.orders;
      state.orders.pagination = action.payload.pagination;
      state.orders.error = null;
      state.orders.message = null;
    },
    fetchOrdersFailure: (state, action: PayloadAction<string>) => {
      state.orders.status = ReduxStateType.ERROR;
      state.orders.error = action.payload;
      state.orders.message = action.payload;
      state.orders.data = [];
    },

    applyProfileOrderUpdate: (
      state,
      action: PayloadAction<{
        orderId: string;
        orderStatus?: string;
        patch?: Partial<Order>;
      }>
    ) => {
      const { orderId, orderStatus, patch } = action.payload;
      const index = state.orders.data.findIndex((order) => order._id === orderId);

      if (index === -1) {
        if (patch) {
          const resolvedStatus = (
            orderStatus ||
            patch.orderStatus ||
            (patch as any)?.status ||
            "pending"
          ) as Order["status"];
          const mergedOrder: Order = {
            ...(patch as Order),
            _id: orderId,
            status: resolvedStatus,
            orderStatus: resolvedStatus,
            totalAmount:
              patch.totalAmount ?? (patch as any)?.subtotal ?? 0,
            shippingFee: patch.shippingFee ?? 0,
            discountAmount:
              patch.discountAmount ?? (patch as any)?.discount ?? 0,
            createdAt: patch.createdAt || new Date().toISOString(),
            updatedAt: patch.updatedAt || new Date().toISOString(),
            orderItems: patch.orderItems || [],
          } as Order;
          state.orders.data = [mergedOrder, ...state.orders.data];
        }
        return;
      }

      const currentOrder = state.orders.data[index];
      const updatedOrder: Order = {
        ...currentOrder,
        ...(patch as Partial<Order>),
      };
      const resolvedStatus = (
        orderStatus ||
        patch?.orderStatus ||
        (patch as any)?.status
      ) as Order["status"] | undefined;
      if (resolvedStatus) {
        updatedOrder.orderStatus = resolvedStatus;
        updatedOrder.status = resolvedStatus;
      }

      updatedOrder.updatedAt = patch?.updatedAt || new Date().toISOString();
      state.orders.data[index] = updatedOrder;
    },

    // Addresses list
    fetchAddressesStart: (state) => {
      state.address.status = ReduxStateType.LOADING;
      state.address.error = null;
      state.address.message = null;
    },
    fetchAddressesSuccess: (
      state,
      action: PayloadAction<{
        addresses: Address[];
        defaultAddress: Address | null;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>
    ) => {
      state.address.status = ReduxStateType.SUCCESS;
      state.address.data = action.payload.addresses;
      state.address.defaultAddress = action.payload.defaultAddress;
      state.address.pagination = action.payload.pagination;
      state.address.error = null;
      state.address.message = null;
    },
    fetchAddressesFailure: (state, action: PayloadAction<string>) => {
      state.address.status = ReduxStateType.ERROR;
      state.address.error = action.payload;
      state.address.message = action.payload;
      state.address.data = [];
    },

    // Create address
    createAddressStart: (state, _action: PayloadAction<CreateAddressRequest>) => {
      state.address.createAddress.status = ReduxStateType.LOADING;
      state.address.createAddress.error = null;
      state.address.createAddress.message = null;
    },
    createAddressSuccess: (state, action: PayloadAction<Address>) => {
      state.address.createAddress.status = ReduxStateType.SUCCESS;
      // Không thêm địa chỉ vào state ở đây vì đã được reload từ fetchAddressesSuccess rồi
      // Chỉ đánh dấu status thành công
      state.address.createAddress.error = null;
      state.address.createAddress.message = null;
    },
    createAddressFailure: (state, action: PayloadAction<string>) => {
      state.address.createAddress.status = ReduxStateType.ERROR;
      state.address.createAddress.error = action.payload;
      state.address.createAddress.message = action.payload;
    },

    // Update address
    updateAddressStart: (
      state,
      _action: PayloadAction<{ id: string; data: UpdateAddressRequest }>
    ) => {
      state.address.updateAddress.status = ReduxStateType.LOADING;
      state.address.updateAddress.error = null;
      state.address.updateAddress.message = null;
    },
    updateAddressSuccess: (state, action: PayloadAction<Address>) => {
      state.address.updateAddress.status = ReduxStateType.SUCCESS;
      // Nếu địa chỉ được update là mặc định, hủy mặc định của các địa chỉ khác
      if (action.payload.isDefault) {
        state.address.defaultAddress = action.payload;
        state.address.data = state.address.data.map((addr) => {
          if (addr._id === action.payload._id) {
            return action.payload;
          }
          return { ...addr, isDefault: false };
        });
      } else {
        // Nếu địa chỉ được update không phải mặc định, chỉ cập nhật địa chỉ đó
        state.address.data = state.address.data.map((addr) =>
          addr._id === action.payload._id ? action.payload : addr
        );
        // Nếu địa chỉ được update là defaultAddress hiện tại và không còn là mặc định, tìm địa chỉ mặc định khác
        if (state.address.defaultAddress?._id === action.payload._id) {
          const newDefault = state.address.data.find((addr) => addr.isDefault);
          state.address.defaultAddress = newDefault || null;
        }
      }
      state.address.updateAddress.error = null;
      state.address.updateAddress.message = null;
    },
    updateAddressFailure: (state, action: PayloadAction<string>) => {
      state.address.updateAddress.status = ReduxStateType.ERROR;
      state.address.updateAddress.error = action.payload;
      state.address.updateAddress.message = action.payload;
    },

    // Delete address
    deleteAddressStart: (state, _action: PayloadAction<{ id: string }>) => {
      state.address.deleteAddress.status = ReduxStateType.LOADING;
      state.address.deleteAddress.error = null;
      state.address.deleteAddress.message = null;
    },
    deleteAddressSuccess: (state, action: PayloadAction<string>) => {
      state.address.deleteAddress.status = ReduxStateType.SUCCESS;
      state.address.data = state.address.data.filter((addr) => addr._id !== action.payload);
      state.address.deleteAddress.error = null;
      state.address.deleteAddress.message = null;
    },
    deleteAddressFailure: (state, action: PayloadAction<string>) => {
      state.address.deleteAddress.status = ReduxStateType.ERROR;
      state.address.deleteAddress.error = action.payload;
      state.address.deleteAddress.message = action.payload;
    },

    // Set default address
    setDefaultAddressStart: (state, _action: PayloadAction<{ id: string }>) => {
      state.address.status = ReduxStateType.LOADING;
    },
    setDefaultAddressSuccess: (state, action: PayloadAction<Address>) => {
      state.address.status = ReduxStateType.SUCCESS;
      state.address.defaultAddress = action.payload;
      // Move default address to front for UX
      state.address.data = [
        action.payload,
        ...state.address.data.filter((addr) => addr._id !== action.payload._id),
      ];
    },
    setDefaultAddressFailure: (state, action: PayloadAction<string>) => {
      state.address.status = ReduxStateType.ERROR;
      state.address.error = action.payload;
      state.address.message = action.payload;
    },

    // Wishlist
    fetchWishlistStart: (state) => {
      state.wishlist.status = ReduxStateType.LOADING;
      state.wishlist.error = null;
      state.wishlist.message = null;
    },
    fetchWishlistSuccess: (
      state,
      action: PayloadAction<{
        items: WishlistItem[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>
    ) => {
      state.wishlist.status = ReduxStateType.SUCCESS;
      state.wishlist.data = action.payload.items;
      state.wishlist.pagination = action.payload.pagination;
      state.wishlist.error = null;
      state.wishlist.message = null;
    },
    fetchWishlistFailure: (state, action: PayloadAction<string>) => {
      state.wishlist.status = ReduxStateType.ERROR;
      state.wishlist.error = action.payload;
      state.wishlist.message = action.payload;
      state.wishlist.data = [];
    },
    addToWishlistSuccess: (state, action: PayloadAction<WishlistItem>) => {
      const existingIndex = state.wishlist.data.findIndex(
        (item) => item.productId === action.payload.productId
      );
      if (existingIndex === -1) {
        state.wishlist.data.unshift(action.payload);
        state.wishlist.pagination.total += 1;
      }
    },
    removeFromWishlistSuccess: (state, action: PayloadAction<string>) => {
      state.wishlist.data = state.wishlist.data.filter(
        (item) => item.productId !== action.payload
      );
      state.wishlist.pagination.total = Math.max(0, state.wishlist.pagination.total - 1);
    },
    clearWishlistSuccess: (state) => {
      state.wishlist.data = [];
      state.wishlist.pagination.total = 0;
    },

    // Shop Following
    checkShopFollowingStart: (state, _action: PayloadAction<{ shopId: string }>) => {
      state.shopFollowing.status = ReduxStateType.LOADING;
      state.shopFollowing.error = null;
      state.shopFollowing.message = null;
    },
    checkShopFollowingSuccess: (
      state,
      action: PayloadAction<{ shopId: string; isFollowing: boolean; followersCount: number }>
    ) => {
      state.shopFollowing.status = ReduxStateType.SUCCESS;
      state.shopFollowing.data[action.payload.shopId] = {
        isFollowing: action.payload.isFollowing,
        followersCount: action.payload.followersCount,
      };
      state.shopFollowing.error = null;
      state.shopFollowing.message = null;
    },
    checkShopFollowingFailure: (state, action: PayloadAction<string>) => {
      state.shopFollowing.status = ReduxStateType.ERROR;
      state.shopFollowing.error = action.payload;
      state.shopFollowing.message = action.payload;
    },
    updateShopFollowingStatus: (
      state,
      action: PayloadAction<{ shopId: string; isFollowing: boolean; followersCount: number }>
    ) => {
      state.shopFollowing.data[action.payload.shopId] = {
        isFollowing: action.payload.isFollowing,
        followersCount: action.payload.followersCount,
      };
    },

    // Reset
    resetProfileState: () => initialState,
  },
  persist: {
    whitelist: ["wishlist", "cart", "orders", "address", "profile", "shopFollowing"],
  },
});

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  fetchCartStart,
  fetchCartSuccess,
  fetchCartFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  applyProfileOrderUpdate,
  fetchAddressesStart,
  fetchAddressesSuccess,
  fetchAddressesFailure,
  createAddressStart,
  createAddressSuccess,
  createAddressFailure,
  updateAddressStart,
  updateAddressSuccess,
  updateAddressFailure,
  deleteAddressStart,
  deleteAddressSuccess,
  deleteAddressFailure,
  setDefaultAddressStart,
  setDefaultAddressSuccess,
  setDefaultAddressFailure,
  fetchWishlistStart,
  fetchWishlistSuccess,
  fetchWishlistFailure,
  addToWishlistSuccess,
  removeFromWishlistSuccess,
  clearWishlistSuccess,
  checkShopFollowingStart,
  checkShopFollowingSuccess,
  checkShopFollowingFailure,
  updateShopFollowingStatus,
  resetProfileState,
} = profileSlice.actions;

export default profileReducer;
