import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectWishlist,
  selectWishlistStatus,
  selectWishlistError,
  selectWishlistPagination,
} from "../slice/profile.selector";
import { fetchWishlistStart } from "../slice/profile.slice";
import { userWishlistApi } from "@/core/api/wishlist";
import { addToast } from "@/app/store/slices/toast";
import {
  addToWishlistSuccess,
  removeFromWishlistSuccess,
  clearWishlistSuccess,
} from "../slice/profile.slice";
import type { WishlistItem } from "@/core/api/wishlist/type";

export function useWishlist() {
  const dispatch = useAppDispatch();

  const wishlist = useAppSelector(selectWishlist);
  const wishlistStatus = useAppSelector(selectWishlistStatus);
  const wishlistError = useAppSelector(selectWishlistError);
  const wishlistPagination = useAppSelector(selectWishlistPagination);

  const loadWishlist = useCallback(() => {
    dispatch(fetchWishlistStart());
  }, [dispatch]);

  const addToWishlist = useCallback(
    async (productId: string) => {
      try {
        const response = await userWishlistApi.addToWishlist(productId);
        if (response.data?.wishlist) {
          // Find the newly added item
          const newItem = response.data.wishlist.items.find(
            (item) => item.productId === productId
          );
          if (newItem) {
            dispatch(addToWishlistSuccess(newItem));
          }
          dispatch(
            addToast({
              type: "success",
              message: response.message || "Đã thêm vào danh sách yêu thích",
            })
          );
          return true;
        }
        return false;
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Không thể thêm vào danh sách yêu thích. Vui lòng thử lại.";
        dispatch(addToast({ type: "error", message }));
        return false;
      }
    },
    [dispatch]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      try {
        const response = await userWishlistApi.removeFromWishlist(productId);
        if (response.data?.wishlist) {
          dispatch(removeFromWishlistSuccess(productId));
          dispatch(
            addToast({
              type: "success",
              message: response.message || "Đã xóa khỏi danh sách yêu thích",
            })
          );
          return true;
        }
        return false;
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Không thể xóa khỏi danh sách yêu thích. Vui lòng thử lại.";
        dispatch(addToast({ type: "error", message }));
        return false;
      }
    },
    [dispatch]
  );

  const clearWishlist = useCallback(async () => {
    try {
      const response = await userWishlistApi.clearWishlist();
      if (response.data) {
        dispatch(clearWishlistSuccess());
        dispatch(
          addToast({
            type: "success",
            message: response.message || "Đã xóa toàn bộ danh sách yêu thích",
          })
        );
        return true;
      }
      return false;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể xóa danh sách yêu thích. Vui lòng thử lại.";
      dispatch(addToast({ type: "error", message }));
      return false;
    }
  }, [dispatch]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const isInWishlist = wishlist.some((item: WishlistItem) => item.productId === productId);
      if (isInWishlist) {
        return await removeFromWishlist(productId);
      } else {
        return await addToWishlist(productId);
      }
    },
    [wishlist, addToWishlist, removeFromWishlist]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.some((item: WishlistItem) => item.productId === productId);
    },
    [wishlist]
  );

  return {
    wishlist,
    wishlistStatus,
    wishlistError,
    wishlistPagination,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    toggleWishlist,
    isInWishlist,
  };
}

