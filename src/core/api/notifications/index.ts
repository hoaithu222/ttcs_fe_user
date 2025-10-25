import { USER_NOTIFICATIONS_ENDPOINTS, buildEndpoint } from "./path";
import type {
  Notification,
  NotificationListQuery,
  NotificationListResponse,
  UnreadCountResponse,
  ApiSuccess,
} from "./type";
import { UserHttpClient } from "@/core/base/http-client";

// Notifications API service for users
class UserNotificationsApiService extends UserHttpClient {
  constructor() {
    super(import.meta.env.VITE_API_BASE_URL || "");
  }

  // Get notifications list
  async getNotifications(
    query?: NotificationListQuery
  ): Promise<ApiSuccess<NotificationListResponse>> {
    const response = await this.get(USER_NOTIFICATIONS_ENDPOINTS.LIST, { params: query });
    return response.data;
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<ApiSuccess<Notification>> {
    const endpoint = buildEndpoint(USER_NOTIFICATIONS_ENDPOINTS.MARK_READ, { id });
    const response = await this.patch(endpoint);
    return response.data;
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiSuccess<void>> {
    const response = await this.patch(USER_NOTIFICATIONS_ENDPOINTS.MARK_ALL_READ);
    return response.data;
  }

  // Delete notification
  async deleteNotification(id: string): Promise<ApiSuccess<void>> {
    const endpoint = buildEndpoint(USER_NOTIFICATIONS_ENDPOINTS.DELETE, { id });
    const response = await this.delete(endpoint);
    return response.data;
  }

  // Get unread count
  async getUnreadCount(): Promise<ApiSuccess<UnreadCountResponse>> {
    const response = await this.get(USER_NOTIFICATIONS_ENDPOINTS.UNREAD_COUNT);
    return response.data;
  }
}

// Export singleton instance
export const userNotificationsApi = new UserNotificationsApiService();

// Export default
export default userNotificationsApi;
