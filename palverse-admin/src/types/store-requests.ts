import { PaginatedApiSuccessResponse } from "./api";

export type StoreRequestStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "needs_changes" | "cancelled";

export interface StoreRegistrationRequest {
  public_id: string;
  proposed_merchant_name: string;
  store_name_ar: string;
  store_name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  category_public_id: string | null;
  city_public_id: string | null;
  zone_public_id: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address_ar: string | null;
  address_en: string | null;
  latitude: number | null;
  longitude: number | null;
  representative?: {
    public_id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: StoreRequestStatus;
  rejection_reason: string | null;
  changes_requested_reason: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
  
  category?: { public_id: string; name_ar: string; name_en: string };
  city?: { public_id: string; name_ar: string; name_en: string };
  zone?: { public_id: string; name_ar: string; name_en: string };

  resulting_store?: {
    public_id: string;
    name_ar: string;
    slug?: string | null;
  } | null;
  resulting_merchant?: {
    public_id: string;
    name: string;
  } | null;
}

export interface StoreRequestListParams {
  query?: string;
  status?: StoreRequestStatus | "";
  page?: number;
  per_page?: number;
}

export type StoreRequestsListResponse = PaginatedApiSuccessResponse<StoreRegistrationRequest>;
