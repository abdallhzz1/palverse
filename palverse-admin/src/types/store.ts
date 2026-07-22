import { PaginatedApiSuccessResponse } from "./api";

export type StoreStatus = "pending" | "approved" | "rejected";

export interface StoreMediaSummary {
  public_id: string;
  url: string;
  type: string;
  sort_order: number;
}

export interface StoreCategorySummary {
  public_id: string;
  name_ar: string;
  name_en: string;
  slug: string;
}

export interface StoreCitySummary {
  public_id: string;
  name_ar: string;
  name_en: string;
}

export interface StoreZoneSummary {
  public_id: string;
  name_ar: string;
  name_en: string;
}

export interface StoreOwnerSummary {
  public_id: string;
  name: string;
  email: string;
}

export interface AdminStore {
  public_id: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  slug: string | null;
  web_url?: string;
  deep_link?: string;
  qr_url?: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address_ar: string | null;
  address_en: string | null;
  latitude: number | null;
  longitude: number | null;
  status: StoreStatus;
  is_active: boolean;
  has_active_subscription?: boolean;
  is_publicly_visible?: boolean;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason?: string | null;
  owner?: StoreOwnerSummary;
  category?: StoreCategorySummary;
  city?: StoreCitySummary;
  zone?: StoreZoneSummary;
  created_at: string;
  updated_at: string;
  logo?: StoreMediaSummary;
  cover?: StoreMediaSummary;
  gallery?: StoreMediaSummary[];
  working_hours?: import('./store-details').StoreWorkingHour[];
  social_links?: import('./store-details').StoreSocialLink[];
  offers_count?: number;
  current_offers_count?: number;
}

export interface SubscriptionPlanSummary {
  public_id: string;
  name_ar: string;
  name_en: string;
  code: string;
  price: number;
  currency: string;
  duration_days: number;
}

export interface StoreSubscriptionSummary {
  public_id: string;
  status: "active" | "expired" | "cancelled" | "pending";
  starts_at: string;
  ends_at: string;
  activated_at: string | null;
  cancelled_at: string | null;
  expired_at: string | null;
  cancellation_reason?: string | null;
  is_currently_valid: boolean;
  plan: SubscriptionPlanSummary;
  store?: AdminStore;
}

export type StoreSubscriptionsListResponse = PaginatedApiSuccessResponse<StoreSubscriptionSummary>;

export interface StoresListParams {
  query?: string;
  status?: StoreStatus | "";
  is_active?: boolean | string | "";
  owner_public_id?: string;
  category_public_id?: string;
  city_public_id?: string;
  zone_public_id?: string;
  sort?: string;
  direction?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export type StoresListResponse = PaginatedApiSuccessResponse<AdminStore>;

export interface RejectStoreRequest {
  rejection_reason: string;
}

export interface StoreLinksResponse {
  web_url: string;
  deep_link: string;
}

export interface UpdateAdminStoreRequest {
  name_ar?: string;
  name_en?: string | null;
  description_ar?: string;
  description_en?: string | null;
  phone?: string;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address_ar?: string;
  address_en?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  category_public_id?: string;
  city_public_id?: string;
  zone_public_id?: string;
}
