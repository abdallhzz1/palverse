import { PaginatedApiSuccessResponse } from "./api";

export interface SubscriptionPlan {
  public_id: string;
  name_ar: string;
  name_en: string | null;
  code: string;
  description_ar: string | null;
  description_en: string | null;
  price: string | number;
  currency: string | null;
  duration_days: number;
  max_offers: number | null;
  max_gallery_images: number | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export type SubscriptionPlansListResponse = PaginatedApiSuccessResponse<SubscriptionPlan>;

export interface SubscriptionPlansListParams {
  query?: string;
  status?: "active" | "inactive" | "";
  sort?: string;
  direction?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface StoreSubscriptionPlanRequest {
  name_ar: string;
  name_en?: string | null;
  code: string;
  description_ar?: string | null;
  description_en?: string | null;
  price: number;
  currency?: string | null;
  duration_days: number;
  max_offers?: number | null;
  max_gallery_images?: number | null;
  is_active?: boolean;
  sort_order?: number | null;
}

export interface UpdateSubscriptionPlanRequest {
  name_ar?: string;
  name_en?: string | null;
  code?: string;
  description_ar?: string | null;
  description_en?: string | null;
  price?: number;
  currency?: string | null;
  duration_days?: number;
  max_offers?: number | null;
  max_gallery_images?: number | null;
  is_active?: boolean;
  sort_order?: number | null;
}
