import { PaginatedApiSuccessResponse, ApiSuccessResponse } from "./api";

export type NotificationType =
  | "store_approved"
  | "store_rejected"
  | "store_activated"
  | "store_deactivated"
  | "subscription_assigned"
  | "subscription_cancelled"
  | "subscription_expiring_soon"
  | "subscription_expired"
  | "unknown";

export interface UserNotification {
  id: string; // UUID
  type: NotificationType;
  title_ar: string | null;
  title_en: string | null;
  message_ar: string | null;
  message_en: string | null;
  entity_type: string | null;
  entity_public_id: string | null;
  action_url: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsListParams {
  unread?: boolean;
  type?: NotificationType | "";
  page?: number;
  per_page?: number;
  sort?: "created_at";
  direction?: "asc" | "desc";
}

export type NotificationsListResponse = PaginatedApiSuccessResponse<UserNotification>;

export type UnreadCountResponse = ApiSuccessResponse<{ unread_count: number }>;
export type MarkAllAsReadResponse = ApiSuccessResponse<{ marked_count: number }>;
export type NotificationResponse = ApiSuccessResponse<UserNotification>;
