import { ReduxStateType } from "@/app/store/types";
import { Notification, NotificationListQuery } from "@/core/api/notifications/type";

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  lastQuery?: NotificationListQuery;
  status: ReduxStateType;
  error: string | null;
  message: string | null;
  markAsRead: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  markAllAsRead: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
  deleteNotification: {
    status: ReduxStateType;
    error: string | null;
    message: string | null;
  };
}

