import { PaginatedApiSuccessResponse } from "./api";
import { AdminStore } from "./store";

export interface AdminOffer {
  public_id: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  price: string | number;
  old_price: string | number | null;
  currency: string;
  discount_percentage: number | null;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  is_currently_valid: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  store?: AdminStore;
}

export type OffersListResponse = PaginatedApiSuccessResponse<AdminOffer>;

export interface OffersListParams {
  query?: string;
  store_public_id?: string;
  owner_public_id?: string;
  is_active?: boolean | string | "";
  valid_now?: boolean | string | "";
  sort?: string;
  direction?: "asc" | "desc";
  page?: number;
  per_page?: number;
}
