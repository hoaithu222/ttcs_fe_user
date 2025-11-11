import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { selectProfile, selectProfileStatus } from "../slice/profile.selector";
import { fetchProfileStart, updateProfileStart } from "../slice/profile.slice";
import type { User } from "@/core/api/auth/type";

export function useInfoAccount() {
  const dispatch = useAppDispatch();

  const profile = useAppSelector(selectProfile);
  const profileStatus = useAppSelector(selectProfileStatus);

  const loadProfile = useCallback(() => {
    dispatch(fetchProfileStart());
  }, [dispatch]);

  const updateProfile = useCallback((data: Partial<User>) => {
    dispatch(updateProfileStart(data));
  }, [dispatch]);

  return { profile, profileStatus, loadProfile, updateProfile };
}
