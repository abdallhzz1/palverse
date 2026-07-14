import { PaginatedApiSuccessResponse } from "./api";
import { AdminStore } from "./store";
import { SubscriptionPlan } from "./subscription-plans";

export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";

export interface StoreSubscription {
  public_id: string;
  status: SubscriptionStatus;
  starts_at: string | null;
  ends_at: string | null;
  activated_at: string | null;
  cancelled_at: string | null;
  expired_at: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  price_snapshot: string | number | null;
  currency_snapshot: string | null;
  plan_name_ar_snapshot: string | null;
  plan_name_en_snapshot: string | null;
  is_currently_valid: boolean;
  plan?: SubscriptionPlan;
  store?: AdminStore;
  assigned_by?: {
    public_id: string;
    name: string;
  };
  cancelled_by?: {
    public_id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export type StoreSubscriptionsListResponse = PaginatedApiSuccessResponse<StoreSubscription>;

export interface StoreSubscriptionsListParams {
  status?: string;
  store_public_id?: string;
  plan_public_id?: string;
  starts_from?: string;
  starts_to?: string;
  ends_from?: string;
  ends_to?: string;
  sort?: string;
  direction?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface AssignStoreSubscriptionRequest {
  store_public_id: string;
  subscription_plan_public_id: string;
  starts_at?: string | null;
  ends_at?: string | null;
  notes?: string | null;
}

export interface CancelStoreSubscriptionRequest {
  cancellation_reason: string;
}
