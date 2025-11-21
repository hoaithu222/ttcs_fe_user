import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  selectShopFollowing,
  selectShopFollowingStatus,
  selectShopFollowingError,
} from "../slice/profile.selector";
import {
  checkShopFollowingStart,
  updateShopFollowingStatus,
} from "../slice/profile.slice";
import { userShopsApi } from "@/core/api/shops";
import { addToast } from "@/app/store/slices/toast";
import type { FollowStatusResponse } from "@/core/api/shops/type";

export function useShopFollowing() {
  const dispatch = useAppDispatch();

  const shopFollowing = useAppSelector(selectShopFollowing);
  const shopFollowingStatus = useAppSelector(selectShopFollowingStatus);
  const shopFollowingError = useAppSelector(selectShopFollowingError);

  const checkFollowingStatus = useCallback(
    (shopId: string) => {
      dispatch(checkShopFollowingStart({ shopId }));
    },
    [dispatch]
  );

  const isFollowing = useCallback(
    (shopId: string): boolean => {
      return shopFollowing[shopId]?.isFollowing || false;
    },
    [shopFollowing]
  );

  const getFollowersCount = useCallback(
    (shopId: string): number => {
      return shopFollowing[shopId]?.followersCount || 0;
    },
    [shopFollowing]
  );

  const followShop = useCallback(
    async (shopId: string) => {
      try {
        const response = await userShopsApi.followShop(shopId);
        if (response.data) {
          dispatch(
            updateShopFollowingStatus({
              shopId,
              isFollowing: response.data.isFollowing || true,
              followersCount: response.data.followersCount || 0,
            })
          );
          dispatch(
            addToast({
              type: "success",
              message: response.message || "Đã theo dõi cửa hàng",
            })
          );
          return true;
        }
        return false;
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Không thể theo dõi cửa hàng. Vui lòng thử lại.";
        dispatch(addToast({ type: "error", message }));
        return false;
      }
    },
    [dispatch]
  );

  const unfollowShop = useCallback(
    async (shopId: string) => {
      try {
        const response = await userShopsApi.unfollowShop(shopId);
        if (response.data) {
          dispatch(
            updateShopFollowingStatus({
              shopId,
              isFollowing: response.data.isFollowing || false,
              followersCount: response.data.followersCount || 0,
            })
          );
          dispatch(
            addToast({
              type: "success",
              message: response.message || "Đã bỏ theo dõi cửa hàng",
            })
          );
          return true;
        }
        return false;
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Không thể bỏ theo dõi cửa hàng. Vui lòng thử lại.";
        dispatch(addToast({ type: "error", message }));
        return false;
      }
    },
    [dispatch]
  );

  const toggleFollowShop = useCallback(
    async (shopId: string) => {
      const currentlyFollowing = isFollowing(shopId);
      if (currentlyFollowing) {
        return await unfollowShop(shopId);
      } else {
        return await followShop(shopId);
      }
    },
    [isFollowing, followShop, unfollowShop]
  );

  return {
    shopFollowing,
    shopFollowingStatus,
    shopFollowingError,
    checkFollowingStatus,
    isFollowing,
    getFollowersCount,
    followShop,
    unfollowShop,
    toggleFollowShop,
  };
}

