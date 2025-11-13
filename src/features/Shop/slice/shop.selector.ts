import { IShopState, ShopStatus } from "./shop.type";
import { ReduxStateType } from "@/app/store/types";

// Root selector hint: adjust path to your actual root reducer mapping
export const selectShopState = (state: any): IShopState => state.shop as IShopState;

// Shop data selectors
export const selectShopData = (state: any) => selectShopState(state).shop.data;
export const selectShopFetchStatus = (state: any) => selectShopState(state).shop.status;
export const selectShopError = (state: any) => selectShopState(state).shop.error;

// Shop info selectors
export const selectShopInfo = (state: any) => selectShopState(state).shopInfo.data;
export const selectShopInfoStatus = (state: any) => selectShopState(state).shopInfo.status;
export const selectShopInfoError = (state: any) => selectShopState(state).shopInfo.error;

// Create shop selectors
export const selectCreateShopStatus = (state: any) => selectShopState(state).createShop.status;
export const selectCreateShopError = (state: any) => selectShopState(state).createShop.error;

// Update shop selectors
export const selectUpdateShopStatus = (state: any) => selectShopState(state).updateShop.status;
export const selectUpdateShopError = (state: any) => selectShopState(state).updateShop.error;

// Products selectors
export const selectProducts = (state: any) => selectShopState(state).products.data;
export const selectProductsStatus = (state: any) => selectShopState(state).products.status;
export const selectProductsError = (state: any) => selectShopState(state).products.error;
export const selectProductsPagination = (state: any) => selectShopState(state).products.pagination;

// Orders selectors
export const selectOrders = (state: any) => selectShopState(state).orders.data;
export const selectOrdersStatus = (state: any) => selectShopState(state).orders.status;
export const selectOrdersError = (state: any) => selectShopState(state).orders.error;
export const selectOrdersPagination = (state: any) => selectShopState(state).orders.pagination;

// Update order status selectors
export const selectUpdateOrderStatusStatus = (state: any) =>
  selectShopState(state).updateOrderStatus.status;
export const selectUpdateOrderStatusError = (state: any) =>
  selectShopState(state).updateOrderStatus.error;

// Registration data selectors
export const selectRegistrationData = (state: any) => selectShopState(state).registrationData;
export const selectShopCurrentStatus = (state: any): ShopStatus =>
  selectShopState(state).currentStatus;

// Shop status by user selectors
export const selectShopStatusByUser = (state: any) =>
  selectShopState(state).shopStatusByUser.data;
export const selectShopStatusByUserStatus = (state: any) =>
  selectShopState(state).shopStatusByUser.status;
export const selectShopStatusByUserError = (state: any) =>
  selectShopState(state).shopStatusByUser.error;

export const selectShopUiScreens = (state: any) => {
  const status = selectShopCurrentStatus(state);
  return {
    showRegistrationLanding:
      status === ShopStatus.PENDING_REGISTRATION || status === ShopStatus.INFORMATION_INPUT,
    showPendingReview: status === ShopStatus.PENDING_REVIEW,
    showRejected: status === ShopStatus.REJECTED,
    showSetup: status === ShopStatus.SETUP_IN_PROGRESS,
    showActiveDashboard: status === ShopStatus.ACTIVE,
    showSuspended: status === ShopStatus.SUSPENDED || status === ShopStatus.BLOCKED,
  };
};
