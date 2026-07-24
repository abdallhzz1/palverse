import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/types/api";

export type AdvertisementAdType = "featured_store" | "banner";

export interface StoreAdvertisementStore {
  public_id: string;
  name_ar?: string | null;
  name_en?: string | null;
}

export interface StoreAdvertisement {
  public_id: string;
  ad_type: AdvertisementAdType;
  image_path?: string | null;
  start_date: string;
  end_date: string;
  amount_paid: string | number;
  is_active: boolean;
  notes?: string | null;
  store?: StoreAdvertisementStore | null;
}

export interface AdvertisementsListResponse {
  success: boolean;
  data: StoreAdvertisement[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export const advertisementsService = {
  list() {
    return apiClient.get("/admin/advertisements") as Promise<AdvertisementsListResponse>;
  },

  create(formData: FormData) {
    return apiClient.post("/admin/advertisements", formData, {
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
