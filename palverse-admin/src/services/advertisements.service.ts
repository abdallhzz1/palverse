import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/types/api";

export type AdvertisementAdType = "featured_store" | "banner";

export interface StoreAdvertisementStore {
  public_id: string;
  name_ar?: string | null;
  name_en?: string | null;
  slug?: string | null;
}

export interface StoreAdvertisement {
  public_id: string;
  ad_type: AdvertisementAdType;
  image_path?: string | null;
  image_url?: string | null;
  start_date: string;
  end_date: string;
  amount_paid: string | number;
  is_active: boolean;
  notes?: string | null;
  store?: StoreAdvertisementStore | null;
  shows_publicly?: boolean;
  homepage_status?: string;
  public_status?: string;
  homepage_reasons?: string[];
  public_reasons?: string[];
  placements?: string[];
  business_today?: string;
}

export interface AdvertisementsListResponse {
  success: boolean;
  data: StoreAdvertisement[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
    business_timezone?: string;
  };
}

export const advertisementsService = {
  list() {
    return apiClient.get("/admin/advertisements") as Promise<AdvertisementsListResponse>;
  },

  show(publicId: string) {
    return apiClient.get(`/admin/advertisements/${publicId}`) as Promise<
      ApiSuccessResponse<StoreAdvertisement>
    >;
  },

  create(formData: FormData) {
    return apiClient.post("/admin/advertisements", formData, {
      timeout: 60000,
    }) as Promise<ApiSuccessResponse<StoreAdvertisement>>;
  },

  update(publicId: string, formData: FormData) {
    // POST multipart (PUT often drops files)
    return apiClient.post(`/admin/advertisements/${publicId}`, formData, {
      timeout: 60000,
    }) as Promise<ApiSuccessResponse<StoreAdvertisement>>;
  },

  setActive(publicId: string, isActive: boolean) {
    return apiClient.put(`/admin/advertisements/${publicId}`, {
      is_active: isActive,
    }) as Promise<ApiSuccessResponse<StoreAdvertisement>>;
  },

  remove(publicId: string) {
    return apiClient.delete(`/admin/advertisements/${publicId}`) as Promise<ApiSuccessResponse<null>>;
  },
};
