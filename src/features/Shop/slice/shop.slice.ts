import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxStateType } from "@/app/store/types";
import type { Shop } from "@/core/api/shops/type";
import { IShopState, ShopStatus } from "./shop.type";
import type { ShopInfo, ShopProduct, ShopOrder } from "@/core/api/shop-management/type";

const initialState: IShopState = {
  currentStatus: ShopStatus.PENDING_REGISTRATION,
  registrationData: {
    name: "",
    description: "",
    logo: "",
    banner: "",
    legalInfo: "",
    bankAccount: "",
    documents: [],
  },

  review: {
    rejectionReason: null,
    suspensionReason: null,
    suspensionEndDate: null,
  },
  shop: {
    data: {} as unknown as Shop,
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  // Thêm state cho các operations khác
  shopInfo: {
    data: null as ShopInfo | null,
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  createShop: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  updateShop: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  products: {
    data: [] as ShopProduct[],
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
    data: [] as ShopOrder[],
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
      orderStatus: undefined as string | undefined,
    },
  },
  updateOrderStatus: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  shopStatusByUser: {
    data: null as {
      shopStatus:
        | "not_registered"
        | "pending_review"
        | "approved"
        | "rejected"
        | "active"
        | "blocked"
        | "suspended";
      shop: {
        id: string;
        name: string;
        slug?: string;
        status: string;
      } | null;
    } | null,
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    // Registration data
    setRegistrationData: (
      state,
      action: PayloadAction<Partial<IShopState["registrationData"]>>
    ) => {
      state.registrationData = { ...state.registrationData, ...action.payload };
    },
    // Review info
    setReviewInfo: (state, action: PayloadAction<Partial<IShopState["review"]>>) => {
      state.review = { ...state.review, ...action.payload };
    },
    // Reset state
    resetShopState: () => initialState,

    // Fetch Own Shop (từ userShopsApi)
    fetchOwnShopStart: (
      state,
      _action: PayloadAction<{ userId: string; page?: number; limit?: number }>
    ) => {
      state.shop.status = ReduxStateType.LOADING;
      state.shop.error = null;
      state.shop.message = null;
    },
    fetchOwnShopSuccess: (state, action: PayloadAction<{ shop: Shop | null }>) => {
      state.shop.status = ReduxStateType.SUCCESS;
      // Nếu shop = null, reset về empty object và reset currentStatus
      if (!action.payload.shop) {
        state.shop.data = {} as unknown as Shop;
        state.currentStatus = ShopStatus.PENDING_REGISTRATION;
        state.registrationData = {
          name: "",
          description: "",
          logo: "",
          banner: "",
          legalInfo: "",
          bankAccount: "",
          documents: [],
        };
      } else {
        const shop = action.payload.shop as Shop;
        state.shop.data = shop;
        // Update currentStatus based on shop status if shopStatusByUser is not available
        if (!state.shopStatusByUser.data) {
          const shopStatus = (shop as any).status;
          if (shopStatus === "pending") {
            state.currentStatus = ShopStatus.PENDING_REVIEW;
          } else if (shopStatus === "active") {
            state.currentStatus = ShopStatus.ACTIVE;
          } else if (shopStatus === "blocked") {
            state.currentStatus = ShopStatus.BLOCKED;
          } else {
            state.currentStatus = ShopStatus.PENDING_REGISTRATION;
          }
        }
      }
      state.shop.error = null;
      state.shop.message = null;
    },
    fetchOwnShopFailure: (state, action: PayloadAction<string>) => {
      state.shop.status = ReduxStateType.ERROR;
      state.shop.error = action.payload;
      state.shop.message = action.payload;
    },

    // Get Shop Info (từ shopManagementApi)
    getShopInfoStart: (state) => {
      state.shopInfo.status = ReduxStateType.LOADING;
      state.shopInfo.error = null;
      state.shopInfo.message = null;
    },
    getShopInfoSuccess: (state, action: PayloadAction<ShopInfo>) => {
      state.shopInfo.status = ReduxStateType.SUCCESS;
      state.shopInfo.data = action.payload;
      state.shopInfo.error = null;
      state.shopInfo.message = null;
    },
    getShopInfoFailure: (state, action: PayloadAction<string>) => {
      state.shopInfo.status = ReduxStateType.ERROR;
      state.shopInfo.error = action.payload;
      state.shopInfo.message = action.payload;
    },

    // Create Shop
    createShopStart: (state, _action: PayloadAction<any>) => {
      state.createShop.status = ReduxStateType.LOADING;
      state.createShop.error = null;
      state.createShop.message = null;
    },
    createShopSuccess: (state, _action: PayloadAction<ShopInfo>) => {
      state.createShop.status = ReduxStateType.SUCCESS;
      state.createShop.error = null;
      state.createShop.message = null;
    },
    createShopFailure: (state, action: PayloadAction<string>) => {
      state.createShop.status = ReduxStateType.ERROR;
      state.createShop.error = action.payload;
      state.createShop.message = action.payload;
    },

    // Update Shop
    updateShopStart: (state, _action: PayloadAction<any>) => {
      state.updateShop.status = ReduxStateType.LOADING;
      state.updateShop.error = null;
      state.updateShop.message = null;
    },
    updateShopSuccess: (state, _action: PayloadAction<ShopInfo>) => {
      state.updateShop.status = ReduxStateType.SUCCESS;
      state.updateShop.error = null;
      state.updateShop.message = null;
    },
    updateShopFailure: (state, action: PayloadAction<string>) => {
      state.updateShop.status = ReduxStateType.ERROR;
      state.updateShop.error = action.payload;
      state.updateShop.message = action.payload;
    },

    // Get Products
    getProductsStart: (
      state,
      action: PayloadAction<{ page?: number; limit?: number; search?: string; isActive?: boolean }>
    ) => {
      state.products.status = ReduxStateType.LOADING;
      state.products.error = null;
      state.products.message = null;
      if (action.payload.page) state.products.pagination.page = action.payload.page;
      if (action.payload.limit) state.products.pagination.limit = action.payload.limit;
    },
    getProductsSuccess: (
      state,
      action: PayloadAction<{
        products: ShopProduct[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>
    ) => {
      state.products.status = ReduxStateType.SUCCESS;
      state.products.data = action.payload.products;
      state.products.pagination = action.payload.pagination;
      state.products.error = null;
      state.products.message = null;
    },
    getProductsFailure: (state, action: PayloadAction<string>) => {
      state.products.status = ReduxStateType.ERROR;
      state.products.error = action.payload;
      state.products.message = action.payload;
      state.products.data = [];
    },

    // Get Orders
    getOrdersStart: (
      state,
      action: PayloadAction<{ page?: number; limit?: number; orderStatus?: string }>
    ) => {
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
    getOrdersSuccess: (
      state,
      action: PayloadAction<{
        orders: ShopOrder[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>
    ) => {
      state.orders.status = ReduxStateType.SUCCESS;
      state.orders.data = action.payload.orders;
      state.orders.pagination = action.payload.pagination;
      state.orders.error = null;
      state.orders.message = null;
    },
    getOrdersFailure: (state, action: PayloadAction<string>) => {
      state.orders.status = ReduxStateType.ERROR;
      state.orders.error = action.payload;
      state.orders.message = action.payload;
      state.orders.data = [];
    },

    applySocketOrderUpdate: (
      state,
      action: PayloadAction<{
        orderId: string;
        orderStatus?: string;
        patch?: Partial<ShopOrder>;
      }>
    ) => {
      const { orderId, orderStatus, patch } = action.payload;
      const index = state.orders.data.findIndex((order) => order._id === orderId);

      if (index === -1) {
        if (patch) {
          const mergedOrder: ShopOrder = {
            ...(patch as ShopOrder),
            _id: orderId,
            orderStatus: orderStatus || patch.orderStatus || (patch as any)?.status || "pending",
            orderNumber:
              patch.orderNumber ||
              (patch as any)?.orderCode ||
              `#${orderId.slice(-6).toUpperCase()}`,
            items: patch.items || [],
            shippingAddress: patch.shippingAddress || ({} as any),
            paymentMethod: patch.paymentMethod || "N/A",
            paymentStatus: patch.paymentStatus || "pending",
            subtotal: patch.subtotal ?? patch.totalAmount ?? 0,
            shippingFee: patch.shippingFee ?? 0,
            discount: patch.discount ?? patch.discountAmount ?? 0,
            totalAmount: patch.totalAmount ?? patch.subtotal ?? 0,
            createdAt: patch.createdAt || new Date().toISOString(),
            updatedAt: patch.updatedAt || new Date().toISOString(),
          };
          state.orders.data = [mergedOrder, ...state.orders.data];
        }
        return;
      }

      const currentOrder = state.orders.data[index];
      const updatedOrder: ShopOrder = {
        ...currentOrder,
        ...(patch as Partial<ShopOrder>),
      };
      if (orderStatus) {
        updatedOrder.orderStatus = orderStatus;
      }
      if ((patch as any)?.status && !orderStatus) {
        updatedOrder.orderStatus = (patch as any).status;
      }
      updatedOrder.updatedAt = patch?.updatedAt || new Date().toISOString();

      state.orders.data[index] = updatedOrder;
    },

    // Update Order Status
    updateOrderStatusStart: (state, _action: PayloadAction<{ orderId: string; data: any }>) => {
      state.updateOrderStatus.status = ReduxStateType.LOADING;
      state.updateOrderStatus.error = null;
      state.updateOrderStatus.message = null;
    },
    updateOrderStatusSuccess: (state) => {
      state.updateOrderStatus.status = ReduxStateType.SUCCESS;
      state.updateOrderStatus.error = null;
      state.updateOrderStatus.message = null;
    },
    updateOrderStatusFailure: (state, action: PayloadAction<string>) => {
      state.updateOrderStatus.status = ReduxStateType.ERROR;
      state.updateOrderStatus.error = action.payload;
      state.updateOrderStatus.message = action.payload;
    },

    // Create Product
    createProductStart: (state, _action: PayloadAction<any>) => {
      state.products.status = ReduxStateType.LOADING;
      state.products.error = null;
      state.products.message = null;
    },
    createProductSuccess: (state, action: PayloadAction<ShopProduct>) => {
      state.products.status = ReduxStateType.SUCCESS;
      state.products.data = [action.payload, ...state.products.data];
      state.products.error = null;
      state.products.message = null;
    },
    createProductFailure: (state, action: PayloadAction<string>) => {
      state.products.status = ReduxStateType.ERROR;
      state.products.error = action.payload;
      state.products.message = action.payload;
    },

    // Delete Product
    deleteProductStart: (state, _action: PayloadAction<{ productId: string }>) => {
      state.products.status = ReduxStateType.LOADING;
      state.products.error = null;
      state.products.message = null;
    },
    deleteProductSuccess: (state, action: PayloadAction<{ productId: string }>) => {
      state.products.status = ReduxStateType.SUCCESS;
      state.products.data = state.products.data.filter((p) => p._id !== action.payload.productId);
      state.products.error = null;
      state.products.message = null;
    },
    deleteProductFailure: (state, action: PayloadAction<string>) => {
      state.products.status = ReduxStateType.ERROR;
      state.products.error = action.payload;
      state.products.message = action.payload;
    },

    // Current status
    setCurrentStatus: (state, action: PayloadAction<{ status: ShopStatus }>) => {
      state.currentStatus = action.payload.status;
    },

    // Reset create shop state
    resetCreateShopState: (state) => {
      state.createShop.status = ReduxStateType.INIT;
      state.createShop.error = null;
      state.createShop.message = null;
    },

    // Fetch Shop Status By User
    fetchShopStatusByUserStart: (state, _action: PayloadAction<{ userId: string }>) => {
      state.shopStatusByUser.status = ReduxStateType.LOADING;
      state.shopStatusByUser.error = null;
      state.shopStatusByUser.message = null;
    },
    fetchShopStatusByUserSuccess: (
      state,
      action: PayloadAction<{
        shopStatus:
          | "not_registered"
          | "pending_review"
          | "approved"
          | "rejected"
          | "active"
          | "blocked"
          | "suspended";
        shop: {
          id: string;
          name: string;
          slug?: string;
          status: string;
        } | null;
      }>
    ) => {
      state.shopStatusByUser.status = ReduxStateType.SUCCESS;
      state.shopStatusByUser.data = action.payload;
      state.shopStatusByUser.error = null;
      state.shopStatusByUser.message = null;

      // Update currentStatus based on shopStatus
      const { shopStatus } = action.payload;
      switch (shopStatus) {
        case "not_registered":
          state.currentStatus = ShopStatus.PENDING_REGISTRATION;
          break;
        case "pending_review":
          state.currentStatus = ShopStatus.PENDING_REVIEW;
          break;
        case "approved":
          state.currentStatus = ShopStatus.APPROVED;
          break;
        case "rejected":
          state.currentStatus = ShopStatus.REJECTED;
          break;
        case "active":
          state.currentStatus = ShopStatus.ACTIVE;
          break;
        case "blocked":
          state.currentStatus = ShopStatus.BLOCKED;
          break;
        case "suspended":
          state.currentStatus = ShopStatus.SUSPENDED;
          break;
        default:
          state.currentStatus = ShopStatus.PENDING_REGISTRATION;
      }
    },
    fetchShopStatusByUserFailure: (state, action: PayloadAction<string>) => {
      state.shopStatusByUser.status = ReduxStateType.ERROR;
      state.shopStatusByUser.error = action.payload;
      state.shopStatusByUser.message = action.payload;
    },
  },
});

export const {
  setRegistrationData,
  setReviewInfo,
  resetShopState,
  fetchOwnShopStart,
  fetchOwnShopSuccess,
  fetchOwnShopFailure,
  getShopInfoStart,
  getShopInfoSuccess,
  getShopInfoFailure,
  createShopStart,
  createShopSuccess,
  createShopFailure,
  updateShopStart,
  updateShopSuccess,
  updateShopFailure,
  getProductsStart,
  getProductsSuccess,
  getProductsFailure,
  getOrdersStart,
  getOrdersSuccess,
  getOrdersFailure,
  applySocketOrderUpdate,
  updateOrderStatusStart,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
  createProductStart,
  createProductSuccess,
  createProductFailure,
  deleteProductStart,
  deleteProductSuccess,
  deleteProductFailure,
  setCurrentStatus,
  resetCreateShopState,
  fetchShopStatusByUserStart,
  fetchShopStatusByUserSuccess,
  fetchShopStatusByUserFailure,
} = shopSlice.actions;
export default shopSlice.reducer;
