import { PaginatedApiSuccessResponse } from "./api";

// We'll define minimal shapes for store/subscription summaries to avoid cyclic deps if they aren't fully built yet.
export interface StoreSummary {
  public_id: string;
  name_ar: string;
  name_en: string;
  status: string;
  [key: string]: unknown;
}

export interface StoreSubscriptionSummary {
  public_id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  [key: string]: unknown;
}

export type UserRole = "admin" | "merchant" | "customer";
export type UserStatus = "active" | "inactive" | "suspended";

export interface ManagedUser {
  public_id: string;
  name: string;
  email: string;
  phone: string;
  preferred_locale: "ar" | "en";
  status: UserStatus;
  roles: UserRole[];
  email_verified_at: string | null;
  last_login_at: string | null;
  suspended_at: string | null;
  suspension_reason?: string | null;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
  stores_count?: number;
  active_subscriptions_count?: number;
  unread_notifications_count?: number;
  created_by?: {
    public_id: string;
    name: string;
  } | null;
  suspended_by?: {
    public_id: string;
    name: string;
  } | null;
  deactivated_by?: {
    public_id: string;
    name: string;
  } | null;
}

export interface UsersListParams {
  query?: string;
  status?: UserStatus | "";
  role?: UserRole | "";
  email_verified?: boolean | string;
  has_stores?: boolean | string;
  created_from?: string; // YYYY-MM-DD
  created_to?: string;   // YYYY-MM-DD
  sort?: "newest" | "oldest" | "name" | "email" | "last_login";
  direction?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export type UsersListResponse = PaginatedApiSuccessResponse<ManagedUser>;

export interface CreateMerchantRequest {
  name: string;
  email: string;
  phone: string;
  preferred_locale: "ar" | "en";
  password?: string;
  password_confirmation?: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phone: string;
  preferred_locale: "ar" | "en";
}

export interface DeactivateUserRequest {
  reason: string;
  revoke_tokens?: boolean;
}

export interface SuspendUserRequest {
  suspension_reason: string;
  revoke_tokens?: boolean;
}

export interface UpdateUserRolesRequest {
  roles: UserRole[];
}

export interface ResetUserPasswordRequest {
  password?: string;
  password_confirmation?: string;
  revoke_tokens?: boolean;
}

export type UserStoresResponse = PaginatedApiSuccessResponse<StoreSummary>;
export type UserSubscriptionsResponse = PaginatedApiSuccessResponse<StoreSubscriptionSummary>;
