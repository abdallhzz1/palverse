import { apiClient } from "@/lib/api/client";
import {
  NotificationsListParams,
  NotificationsListResponse,
  UnreadCountResponse,
  MarkAllAsReadResponse,
  NotificationResponse,
} from "@/types/notifications";

export const notificationsService = {
  list: async (params?: NotificationsListParams): Promise<NotificationsListResponse> => {
    return apiClient.get<unknown, NotificationsListResponse>("/notifications", { params });
  },

  unreadCount: async (): Promise<UnreadCountResponse> => {
    return apiClient.get<unknown, UnreadCountResponse>("/notifications/unread-count");
  },

  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    return apiClient.patch<unknown, MarkAllAsReadResponse>("/notifications/read-all");
  },

  markAsRead: async (id: string): Promise<NotificationResponse> => {
    return apiClient.patch<unknown, NotificationResponse>(`/notifications/${id}/read`);
  },
};
