import { apiClient } from "@/lib/api/client";
import type { BaseResponse } from "@/types/auth";
import type {
  MerchantDashboardSummary,
  RecentActivity,
  MerchantStore,
  StoreDashboardData,
  MediaItem,
  WorkingHours,
  SocialLink,
  MerchantOffer
} from "@/types/merchant";

interface PaginatedData<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

class MerchantService {
  // Dashboard
  async getSummary(): Promise<MerchantDashboardSummary> {
    const res = await apiClient.get<never, BaseResponse<MerchantDashboardSummary>>("/merchant/dashboard/summary");
    return res.data;
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const res = await apiClient.get<never, BaseResponse<any>>(`/merchant/dashboard/recent-activity?limit=${limit}`);
    const raw = res.data;
    const activities: RecentActivity[] = [];

    raw.recent_stores?.forEach((s: any) => {
      activities.push({
        id: `store-${s.public_id}`,
        type: "store",
        action: "متجر",
        description_ar: `المتجر "${s.name_ar}" حالته الآن: ${s.status === 'approved' ? 'معتمد' : s.status === 'pending' ? 'قيد المراجعة' : s.status === 'rejected' ? 'مرفوض' : s.status}`,
        created_at: s.created_at,
      });
    });

    raw.recent_offers?.forEach((o: any) => {
      activities.push({
        id: `offer-${o.public_id}`,
        type: "offer",
        action: "عرض جديد",
        description_ar: `تمت إضافة العرض "${o.title_ar}"`,
        created_at: o.created_at,
      });
    });

    raw.recent_subscriptions?.forEach((sub: any) => {
      activities.push({
        id: `sub-${sub.public_id}`,
        type: "subscription",
        action: "تحديث اشتراك",
        description_ar: `اشتراك "${sub.plan_name}" حالته: ${sub.status}`,
        created_at: sub.created_at,
      });
    });

    raw.recent_notifications?.forEach((n: any) => {
      activities.push({
        id: `notif-${n.id}`,
        type: "notification",
        action: "إشعار جديد",
        description_ar: n.data?.message_ar || "إشعار نظام جديد",
        created_at: n.created_at,
      });
    });

    return activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
  }

  // Stores
  async getStores(page: number = 1): Promise<PaginatedData<MerchantStore>> {
    const res = await apiClient.get<never, any>(`/merchant/stores?page=${page}`);
    return {
      data: res.data,
      meta: res.meta
    };
  }

  async createStore(data: Record<string, any>): Promise<MerchantStore> {
    const res = await apiClient.post<never, BaseResponse<MerchantStore>>("/merchant/stores", data);
    return res.data;
  }

  async getStoreDashboard(storePublicId: string): Promise<StoreDashboardData> {
    const res = await apiClient.get<never, BaseResponse<StoreDashboardData>>(`/merchant/stores/${storePublicId}/dashboard`);
    return res.data;
  }

  async getStore(publicId: string): Promise<MerchantStore> {
    const res = await apiClient.get<never, BaseResponse<MerchantStore>>(`/merchant/stores/${publicId}`);
    return res.data;
  }

  async updateStore(publicId: string, data: Record<string, any>): Promise<MerchantStore> {
    const res = await apiClient.put<never, BaseResponse<MerchantStore>>(`/merchant/stores/${publicId}`, data);
    return res.data;
  }

  async getStoreStatus(publicId: string): Promise<any> {
    const res = await apiClient.get<never, BaseResponse<any>>(`/merchant/stores/${publicId}/status`);
    return res.data;
  }

  async getStoreLinks(publicId: string): Promise<any> {
    const res = await apiClient.get<never, BaseResponse<any>>(`/merchant/stores/${publicId}/links`);
    return res.data;
  }

  async getQrCode(publicId: string): Promise<Blob> {
    const res = await apiClient.get(`/merchant/stores/${publicId}/qr`, {
      responseType: 'blob'
    });
    return res as unknown as Blob;
  }

  // Media
  async uploadLogo(publicId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<never, BaseResponse<any>>(`/merchant/stores/${publicId}/logo`, formData);
    return res.data;
  }

  async deleteLogo(publicId: string): Promise<void> {
    await apiClient.delete(`/merchant/stores/${publicId}/logo`);
  }

  async uploadCover(publicId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<never, BaseResponse<any>>(`/merchant/stores/${publicId}/cover`, formData);
    return res.data;
  }

  async deleteCover(publicId: string): Promise<void> {
    await apiClient.delete(`/merchant/stores/${publicId}/cover`);
  }

  async uploadGalleryImage(publicId: string, file: File): Promise<MediaItem> {
    const formData = new FormData();
    formData.append("files[]", file);
    const res = await apiClient.post<never, BaseResponse<MediaItem>>(`/merchant/stores/${publicId}/gallery`, formData);
    return res.data;
  }

  async deleteGalleryImage(publicId: string, mediaPublicId: string): Promise<void> {
    await apiClient.delete(`/merchant/stores/${publicId}/gallery/${mediaPublicId}`);
  }

  async reorderGallery(publicId: string, orderIds: string[]): Promise<void> {
    await apiClient.patch(`/merchant/stores/${publicId}/gallery/reorder`, { order: orderIds });
  }

  async getWorkingHours(publicId: string): Promise<WorkingHours> {
    const res = await apiClient.get<never, BaseResponse<any[]>>(`/merchant/stores/${publicId}/working-hours`);
    // Backend returns an array of day objects with day_of_week (0-6) and opens_at/closes_at
    // Frontend expects a keyed object: { "0": { is_closed, periods: [{start, end}] }, ... }
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
    // Frontend DAYS IDs match backend day_of_week (0=Sunday, 1=Monday, ..., 6=Saturday)
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

    // Sort by day_of_week to ensure consistent order (0-6)
    days.sort((a, b) => a.day_of_week - b.day_of_week);

    const res = await apiClient.put<never, BaseResponse<WorkingHours>>(
      `/merchant/stores/${publicId}/working-hours`,
      { days }
    );
    return res.data;
  }

  // Social Links
  async getSocialLinks(publicId: string): Promise<SocialLink[]> {
    const res = await apiClient.get<never, BaseResponse<SocialLink[]>>(`/merchant/stores/${publicId}/social-links`);
    return res.data;
  }

  async addSocialLink(publicId: string, data: { platform: string; url: string }): Promise<SocialLink> {
    const res = await apiClient.post<never, BaseResponse<SocialLink>>(`/merchant/stores/${publicId}/social-links`, data);
    return res.data;
  }

  async updateSocialLink(publicId: string, linkId: string, data: { platform: string; url: string }): Promise<SocialLink> {
    const res = await apiClient.put<never, BaseResponse<SocialLink>>(`/merchant/stores/${publicId}/social-links/${linkId}`, data);
    return res.data;
  }

  async deleteSocialLink(publicId: string, linkId: string): Promise<void> {
    await apiClient.delete(`/merchant/stores/${publicId}/social-links/${linkId}`);
  }

  // Offers
  async getOffers(publicId: string, page: number = 1): Promise<PaginatedData<MerchantOffer>> {
    const res = await apiClient.get<never, any>(`/merchant/stores/${publicId}/offers?page=${page}`);
    return {
      data: res.data,
      meta: res.meta
    };
  }

  async getOffer(publicId: string, offerId: string): Promise<MerchantOffer> {
    const res = await apiClient.get<never, BaseResponse<MerchantOffer>>(`/merchant/stores/${publicId}/offers/${offerId}`);
    return res.data;
  }

  async createOffer(publicId: string, data: Record<string, any>): Promise<MerchantOffer> {
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
    
    const res = await apiClient.post<never, BaseResponse<MerchantOffer>>(`/merchant/stores/${publicId}/offers`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  }

  async updateOffer(publicId: string, offerId: string, data: Record<string, any>): Promise<MerchantOffer> {
    // We send PUT with JSON if there is no file upload. 
    // If there is a file, we send POST with _method=PUT to support Laravel multipart spoofing.
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
        const res = await apiClient.post<never, BaseResponse<MerchantOffer>>(`/merchant/stores/${publicId}/offers/${offerId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    } else {
        const res = await apiClient.put<never, BaseResponse<MerchantOffer>>(`/merchant/stores/${publicId}/offers/${offerId}`, data);
        return res.data;
    }
  }

  async deleteOffer(publicId: string, offerId: string): Promise<void> {
    await apiClient.delete(`/merchant/stores/${publicId}/offers/${offerId}`);
  }

  // Subscription
  async getSubscription(publicId: string): Promise<any> {
    const res = await apiClient.get<never, any>(`/merchant/stores/${publicId}/subscription`);
    return res.data;
  }
}

export const merchantService = new MerchantService();
