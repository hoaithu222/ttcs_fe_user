import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

const selectNotificationState = (state: RootState) => (state as any).notification;

export const selectNotifications = createSelector(
  [selectNotificationState],
  (notificationState) => notificationState?.notifications || []
);

export const selectUnreadCount = createSelector(
  [selectNotificationState],
  (notificationState) => notificationState?.unreadCount || 0
);

export const selectNotificationPagination = createSelector(
  [selectNotificationState],
  (notificationState) => notificationState?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  }
);

export const selectNotificationStatus = createSelector(
  [selectNotificationState],
  (notificationState) => notificationState?.status || "INIT"
);

export const selectNotificationError = createSelector(
  [selectNotificationState],
  (notificationState) => notificationState?.error || null
);

export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter((n: any) => !n.isRead)
);

export const selectReadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter((n: any) => n.isRead)
);

