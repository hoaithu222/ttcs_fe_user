import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxStateType } from "@/app/store/types";
import { Notification, NotificationListResponse } from "@/core/api/notifications/type";
import { NotificationState } from "./notification.type";

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  lastQuery: undefined,
  status: ReduxStateType.INIT,
  error: null,
  message: null,
  markAsRead: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  markAllAsRead: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
  deleteNotification: {
    status: ReduxStateType.INIT,
    error: null,
    message: null,
  },
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // Get Notifications
    getNotificationsStart: (state, _action: PayloadAction<{ query?: any }>) => {
      state.status = ReduxStateType.LOADING;
      state.error = null;
      state.message = null;
      if (_action.payload.query) {
        state.lastQuery = _action.payload.query;
      }
    },
    getNotificationsSuccess: (
      state,
      action: PayloadAction<NotificationListResponse>
    ) => {
      state.status = ReduxStateType.SUCCESS;
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
      state.pagination = action.payload.pagination;
      state.error = null;
      state.message = null;
    },
    getNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.status = ReduxStateType.ERROR;
      state.error = action.payload;
      state.message = action.payload;
      state.notifications = [];
    },

    // Update Notification from Socket
    updateNotificationFromSocket: (
      state,
      action: PayloadAction<{
        notification: Notification | Partial<Notification>;
        notificationId?: string;
      }>
    ) => {
      const { notification, notificationId } = action.payload;
      const id = notificationId || (notification as Notification)?._id;
      
      if (!id) return;

      const existingIndex = state.notifications.findIndex((n) => n._id === id);

      if (existingIndex === -1) {
        // Add new notification if it doesn't exist
        const newNotification: Notification = {
          _id: id,
          userId: (notification as Notification).userId || "",
          title: (notification as Notification).title || "",
          message: (notification as Notification).message || "",
          type: (notification as Notification).type || "system",
          isRead: false,
          data: (notification as Notification).data,
          actionUrl: (notification as Notification).actionUrl,
          createdAt: (notification as Notification).createdAt || new Date().toISOString(),
        };
        state.notifications = [newNotification, ...state.notifications];
        state.unreadCount += 1;
        // Update pagination total
        state.pagination.total += 1;
      } else {
        // Update existing notification
        state.notifications[existingIndex] = {
          ...state.notifications[existingIndex],
          ...notification,
        };
      }
    },

    // Mark as Read
    markAsReadStart: (state, _action: PayloadAction<{ id: string }>) => {
      state.markAsRead.status = ReduxStateType.LOADING;
      state.markAsRead.error = null;
      state.markAsRead.message = null;
    },
    markAsReadSuccess: (state, action: PayloadAction<Notification>) => {
      state.markAsRead.status = ReduxStateType.SUCCESS;
      const index = state.notifications.findIndex(
        (n) => n._id === action.payload._id
      );
      if (index !== -1) {
        state.notifications[index] = action.payload;
        if (!action.payload.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
      state.markAsRead.error = null;
      state.markAsRead.message = null;
    },
    markAsReadFailure: (state, action: PayloadAction<string>) => {
      state.markAsRead.status = ReduxStateType.ERROR;
      state.markAsRead.error = action.payload;
      state.markAsRead.message = action.payload;
    },

    // Mark All as Read
    markAllAsReadStart: (state) => {
      state.markAllAsRead.status = ReduxStateType.LOADING;
      state.markAllAsRead.error = null;
      state.markAllAsRead.message = null;
    },
    markAllAsReadSuccess: (state) => {
      state.markAllAsRead.status = ReduxStateType.SUCCESS;
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: new Date().toISOString(),
      }));
      state.unreadCount = 0;
      state.markAllAsRead.error = null;
      state.markAllAsRead.message = null;
    },
    markAllAsReadFailure: (state, action: PayloadAction<string>) => {
      state.markAllAsRead.status = ReduxStateType.ERROR;
      state.markAllAsRead.error = action.payload;
      state.markAllAsRead.message = action.payload;
    },

    // Delete Notification
    deleteNotificationStart: (state, _action: PayloadAction<{ id: string }>) => {
      state.deleteNotification.status = ReduxStateType.LOADING;
      state.deleteNotification.error = null;
      state.deleteNotification.message = null;
    },
    deleteNotificationSuccess: (state, action: PayloadAction<{ id: string }>) => {
      state.deleteNotification.status = ReduxStateType.SUCCESS;
      const notification = state.notifications.find(
        (n) => n._id === action.payload.id
      );
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(
        (n) => n._id !== action.payload.id
      );
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      state.deleteNotification.error = null;
      state.deleteNotification.message = null;
    },
    deleteNotificationFailure: (state, action: PayloadAction<string>) => {
      state.deleteNotification.status = ReduxStateType.ERROR;
      state.deleteNotification.error = action.payload;
      state.deleteNotification.message = action.payload;
    },

    // Reset state
    resetNotificationState: () => initialState,
  },
});

export const {
  getNotificationsStart,
  getNotificationsSuccess,
  getNotificationsFailure,
  updateNotificationFromSocket,
  markAsReadStart,
  markAsReadSuccess,
  markAsReadFailure,
  markAllAsReadStart,
  markAllAsReadSuccess,
  markAllAsReadFailure,
  deleteNotificationStart,
  deleteNotificationSuccess,
  deleteNotificationFailure,
  resetNotificationState,
} = notificationSlice.actions;

export default notificationSlice.reducer;

