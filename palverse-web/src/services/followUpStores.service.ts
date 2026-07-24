import { apiClient } from "@/lib/api/client";
import type { BaseResponse } from "@/types/auth";
import type { WorkingHours } from "@/types/merchant";
import type {
  FollowUpStore,
  FollowUpStoreOffer,
  FollowUpStoreSocialLink,
  FollowUpPaginatedData,
  StoreMediaItem,
} from "@/types/followUpStore";

export interface FollowUpStoreListFilters {
  query?: string;
  status?: string;
  category_public_id?: string;
  city_public_id?: string;
  zone_public_id?: string;
}

class FollowUpStoresService {
  // Stores
  async getStores(page: number = 1, filters: FollowUpStoreListFilters = {}): Promise<FollowUpPaginatedData<FollowUpStore>> {
    const params = new URLSearchParams({ page: page.toString() });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== "all") {
        params.set(key, value);
      }
    });
    const res = await apiClient.get<never, any>(`/follow-up/stores?${params.toString()}`);
    return {
      data: Array.isArray(res.data) ? res.data : [],
      meta: res.meta ?? null,
    };
  }

  async getStore(publicId: string): Promise<FollowUpStore> {
    const res = await apiClient.get<never, BaseResponse<FollowUpStore>>(`/follow-up/stores/${publicId}`);
    return res.data;
  }

  async updateStore(publicId: string, data: Record<string, any>): Promise<FollowUpStore> {
    const res = await apiClient.put<never, BaseResponse<FollowUpStore>>(`/follow-up/stores/${publicId}`, data);
    return res.data;
  }

  // Media
  async uploadLogo(publicId: string, file: File): Promise<StoreMediaItem> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<never, BaseResponse<StoreMediaItem>>(`/follow-up/stores/${publicId}/logo`, formData);
    return res.data;
  }

  async deleteLogo(publicId: string): Promise<void> {
    await apiClient.delete(`/follow-up/stores/${publicId}/logo`);
  }

  async uploadCover(publicId: string, file: File): Promise<StoreMediaItem> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<never, BaseResponse<StoreMediaItem>>(`/follow-up/stores/${publicId}/cover`, formData);
    return res.data;
  }

  async deleteCover(publicId: string): Promise<void> {
    await apiClient.delete(`/follow-up/stores/${publicId}/cover`);
  }

  async uploadGalleryImage(publicId: string, file: File): Promise<StoreMediaItem[]> {
    const formData = new FormData();
    formData.append("files[]", file);
    const res = await apiClient.post<never, BaseResponse<StoreMediaItem[]>>(`/follow-up/stores/${publicId}/gallery`, formData);
    return res.data;
  }

  async deleteGalleryImage(publicId: string, mediaPublicId: string): Promise<void> {
    await apiClient.delete(`/follow-up/stores/${publicId}/gallery/${mediaPublicId}`);
  }

  // Working Hours
  async getWorkingHours(publicId: string): Promise<WorkingHours> {
    const res = await apiClient.get<never, BaseResponse<any[]>>(`/follow-up/stores/${publicId}/working-hours`);
    const raw = Array.isArray(res.data) ? res.data : [];
    const hours: WorkingHours = {};
    raw.forEach((day: any) => {
      const key = String(day.day_of_week);
      hours[key] = {
        is_closed: Boolean(day.is_closed),
        periods: (day.periods || []).map((p: any) => ({
          start: p.opens_at || p.start || "09:00",
          end: p.closes_at || p.end || "17:00",
        })),
      };
    });
    return hours;
  }

  async updateWorkingHours(publicId: string, hours: WorkingHours): Promise<WorkingHours> {
    const days = Object.entries(hours).map(([dayKey, dayData]) => ({
      day_of_week: parseInt(dayKey),
      is_closed: dayData.is_closed,
      periods: dayData.is_closed
        ? []
        : (dayData.periods || []).map(p => ({
            opens_at: p.start,
            closes_at: p.end,
          })),
    }));

    days.sort((a, b) => a.day_of_week - b.day_of_week);

    const res = await apiClient.put<never, BaseResponse<WorkingHours>>(
      `/follow-up/stores/${publicId}/working-hours`,
      { days }
    );
    return res.data;
  }

  // Social Links
  async getSocialLinks(publicId: string): Promise<FollowUpStoreSocialLink[]> {
    const res = await apiClient.get<never, BaseResponse<FollowUpStoreSocialLink[]>>(`/follow-up/stores/${publicId}/social-links`);
    return res.data;
  }

  async addSocialLink(publicId: string, data: { platform: string; url: string }): Promise<FollowUpStoreSocialLink> {
    const res = await apiClient.post<never, BaseResponse<FollowUpStoreSocialLink>>(`/follow-up/stores/${publicId}/social-links`, data);
    return res.data;
  }

  async updateSocialLink(publicId: string, linkId: string, data: { platform: string; url: string }): Promise<FollowUpStoreSocialLink> {
    const res = await apiClient.put<never, BaseResponse<FollowUpStoreSocialLink>>(`/follow-up/stores/${publicId}/social-links/${linkId}`, data);
    return res.data;
  }

  async deleteSocialLink(publicId: string, linkId: string): Promise<void> {
    await apiClient.delete(`/follow-up/stores/${publicId}/social-links/${linkId}`);
  }

  // Offers
  async getOffers(publicId: string, page: number = 1): Promise<FollowUpPaginatedData<FollowUpStoreOffer>> {
    const res = await apiClient.get<never, any>(`/follow-up/stores/${publicId}/offers?page=${page}`);
    return {
      data: Array.isArray(res.data) ? res.data : [],
      meta: res.meta ?? null,
    };
  }

  async getOffer(publicId: string, offerId: string): Promise<FollowUpStoreOffer> {
    const res = await apiClient.get<never, BaseResponse<FollowUpStoreOffer>>(`/follow-up/stores/${publicId}/offers/${offerId}`);
    return res.data;
  }

  async createOffer(publicId: string, data: Record<string, any>): Promise<FollowUpStoreOffer> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === "boolean") {
          formData.append(key, value ? "1" : "0");
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });

    const res = await apiClient.post<never, BaseResponse<FollowUpStoreOffer>>(`/follow-up/stores/${publicId}/offers`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  }

  async updateOffer(publicId: string, offerId: string, data: Record<string, any>): Promise<FollowUpStoreOffer> {
    const hasFile = data.image instanceof File;

    if (hasFile) {
      const formData = new FormData();
      formData.append("_method", "PUT");
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === "boolean") {
            formData.append(key, value ? "1" : "0");
          } else {
            formData.append(key, value as string | Blob);
          }
        }
      });
      const res = await apiClient.post<never, BaseResponse<FollowUpStoreOffer>>(`/follow-up/stores/${publicId}/offers/${offerId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data;
    } else {
      const res = await apiClient.put<never, BaseResponse<FollowUpStoreOffer>>(`/follow-up/stores/${publicId}/offers/${offerId}`, data);
      return res.data;
    }
  }

  async deleteOffer(publicId: string, offerId: string): Promise<void> {
    await apiClient.delete(`/follow-up/stores/${publicId}/offers/${offerId}`);
  }
}

export const followUpStoresService = new FollowUpStoresService();
