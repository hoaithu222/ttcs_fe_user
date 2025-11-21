import { ReduxStateType } from "@/app/store/types";
import { Address } from "@/core/api/addresses/type";
import { User } from "@/core/api/auth/type";
import { Cart } from "@/core/api/cart/type";
import { Order } from "@/core/api/orders/type";
import { WishlistItem } from "@/core/api/wishlist/type";

export interface IProfileState {
  profile: {
    data: User;
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  cart: {
    data: Cart[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  orders: {
    data: Order[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    lastQuery?: {
      page?: number;
      limit?: number;
    };
  };
  //address
  address: {
    data: Address[];
    status: ReduxStateType;
    defaultAddress: Address | null;
    // thêm sửa xóa address
    createAddress: {
      status: ReduxStateType;
      error: string | null;
      message: string | null;
    };
    updateAddress: {
      status: ReduxStateType;
      error: string | null;
      message: string | null;
    };
    deleteAddress: {
      status: ReduxStateType;
      error: string | null;
      message: string | null;
    };
    error: string | null;
    message: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  // wishlist
  wishlist: {
    data: WishlistItem[];
    status: ReduxStateType;
    error: string | null;
    message: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  // shop following - map shopId -> isFollowing status
  shopFollowing: {
    data: Record<string, { isFollowing: boolean; followersCount: number }>; // Map of shopId -> follow status
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
}
