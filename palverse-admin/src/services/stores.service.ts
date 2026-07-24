import { apiClient } from "@/lib/api/client";
import {
  AdminStore,
  RejectStoreRequest,
  SocialLinkPayload,
  StoreLinksResponse,
  StoreMediaSummary,
  StoreOffer,
  StoreOfferPayload,
  StoreOffersListResponse,
  StoreSocialLinkItem,
  StoresListParams,
  StoresListResponse,
  StoreSubscriptionsListResponse,
  UpdateAdminStoreRequest,
  WorkingHours,
} from "@/types/store";
import { ApiSuccessResponse } from "@/types/api";

const BASE_PATH = "/admin/stores";

interface RawWorkingHourDay {
  day_of_week: number;
  is_closed: boolean;
  periods?: { opens_at?: string; closes_at?: string }[];
}

// Backend returns/expects an array of day objects with day_of_week (0-6) and opens_at/closes_at.
// The admin UI works with a keyed object to match the merchant panel shape: { "0": { is_closed, periods: [{start, end}] }, ... }
function mapWorkingHoursResponse(raw: RawWorkingHourDay[]): WorkingHours {
  const hours: WorkingHours = {};
  raw.forEach((day) => {
    hours[String(day.day_of_week)] = {
      is_closed: Boolean(day.is_closed),
      periods: (day.periods || []).map((p) => ({
        start: p.opens_at || "09:00",
        end: p.closes_at || "17:00",
      })),
    };
  });
  return hours;
}

function buildOfferFormData(payload: StoreOfferPayload): FormData {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
    } else {
      formData.append(key, value as string | Blob);
    }
  });
  return formData;
}

export const storesService = {
  list: async (params: StoresListParams): Promise<StoresListResponse> => {
    // Remove empty parameters to keep the URL clean and avoid confusing the backend
    const cleanParams = Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => v !== "" && v !== undefined && v !== null)
        .map(([key, value]) => {
          // Laravel boolean query validation accepts 0/1 more reliably than "true"/"false".
          if (key === "is_active" && typeof value === "boolean") {
            return [key, value ? 1 : 0];
          }
          return [key, value];
        })
    );
    const response = await apiClient.get<unknown, StoresListResponse>(BASE_PATH, { params: cleanParams });
    return response;
  },

  getByPublicId: async (publicId: string): Promise<AdminStore> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<AdminStore>>(`${BASE_PATH}/${publicId}`);
    return response.data;
  },

  approve: async (publicId: string): Promise<AdminStore> => {
    const response = await apiClient.patch<unknown, ApiSuccessResponse<AdminStore>>(`${BASE_PATH}/${publicId}/approve`);
    return response.data;
  },

  reject: async (publicId: string, payload: RejectStoreRequest): Promise<AdminStore> => {
    const response = await apiClient.patch<unknown, ApiSuccessResponse<AdminStore>>(`${BASE_PATH}/${publicId}/reject`, payload);
    return response.data;
  },

  activate: async (publicId: string): Promise<AdminStore> => {
    const response = await apiClient.patch<unknown, ApiSuccessResponse<AdminStore>>(`${BASE_PATH}/${publicId}/activate`);
    return response.data;
  },

  deactivate: async (publicId: string): Promise<AdminStore> => {
    const response = await apiClient.patch<unknown, ApiSuccessResponse<AdminStore>>(`${BASE_PATH}/${publicId}/deactivate`);
    return response.data;
  },

  getLinks: async (publicId: string): Promise<StoreLinksResponse> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<StoreLinksResponse>>(`${BASE_PATH}/${publicId}/links`);
    return response.data;
  },

  getQrBlob: async (publicId: string): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_PATH}/${publicId}/qr`, {
      responseType: "blob",
    });
    return response as unknown as Blob; // Axios interceptor usually returns response.data but for blob we configured it
  },

  getSubscriptions: async (publicId: string): Promise<StoreSubscriptionsListResponse> => {
    // Note: This endpoint actually resides in AdminStoreSubscriptionController according to api.php
    // Route::get('stores/{storePublicId}/subscriptions', ...)
    const response = await apiClient.get<unknown, StoreSubscriptionsListResponse>(`/admin/stores/${publicId}/subscriptions`);
    return response;
  },

  update: async (publicId: string, payload: UpdateAdminStoreRequest): Promise<AdminStore> => {
    const response = await apiClient.put<unknown, ApiSuccessResponse<AdminStore>>(`${BASE_PATH}/${publicId}`, payload);
    return response.data;
  },

  uploadLogo: async (publicId: string, file: File): Promise<StoreMediaSummary> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<unknown, ApiSuccessResponse<StoreMediaSummary>>(`${BASE_PATH}/${publicId}/logo`, formData);
    return response.data;
  },

  deleteLogo: async (publicId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${publicId}/logo`);
  },

  uploadCover: async (publicId: string, file: File): Promise<StoreMediaSummary> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<unknown, ApiSuccessResponse<StoreMediaSummary>>(`${BASE_PATH}/${publicId}/cover`, formData);
    return response.data;
  },

  deleteCover: async (publicId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${publicId}/cover`);
  },

  uploadGallery: async (publicId: string, file: File): Promise<StoreMediaSummary> => {
    const formData = new FormData();
    formData.append("files[]", file);
    const response = await apiClient.post<unknown, ApiSuccessResponse<StoreMediaSummary[] | StoreMediaSummary>>(
      `${BASE_PATH}/${publicId}/gallery`,
      formData
    );
    const data = response.data;
    return Array.isArray(data) ? data[0] : data;
  },

  deleteGallery: async (publicId: string, mediaId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${publicId}/gallery/${mediaId}`);
  },

  // ─── Working Hours ─────────────────────────────────────────────────────
  getWorkingHours: async (publicId: string): Promise<WorkingHours> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<RawWorkingHourDay[]>>(
      `${BASE_PATH}/${publicId}/working-hours`
    );
    return mapWorkingHoursResponse(Array.isArray(response.data) ? response.data : []);
  },

  updateWorkingHours: async (publicId: string, hours: WorkingHours): Promise<WorkingHours> => {
    // Frontend day IDs match backend day_of_week (0=Sunday, 1=Monday, ..., 6=Saturday)
    const days = Object.entries(hours)
      .map(([dayKey, dayData]) => ({
        day_of_week: parseInt(dayKey, 10),
        is_closed: dayData.is_closed,
        periods: dayData.is_closed
          ? []
          : (dayData.periods || []).map((p) => ({
              opens_at: p.start,
              closes_at: p.end,
            })),
      }))
      .sort((a, b) => a.day_of_week - b.day_of_week);

    const response = await apiClient.put<unknown, ApiSuccessResponse<RawWorkingHourDay[]>>(
      `${BASE_PATH}/${publicId}/working-hours`,
      { days }
    );
    return mapWorkingHoursResponse(Array.isArray(response.data) ? response.data : []);
  },

  // ─── Social Links ────────────────────────────────────────────────────────
  getSocialLinks: async (publicId: string): Promise<StoreSocialLinkItem[]> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<StoreSocialLinkItem[]>>(
      `${BASE_PATH}/${publicId}/social-links`
    );
    return response.data;
  },

  addSocialLink: async (publicId: string, payload: SocialLinkPayload): Promise<StoreSocialLinkItem> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<StoreSocialLinkItem>>(
      `${BASE_PATH}/${publicId}/social-links`,
      payload
    );
    return response.data;
  },

  updateSocialLink: async (
    publicId: string,
    linkId: string,
    payload: SocialLinkPayload
  ): Promise<StoreSocialLinkItem> => {
    const response = await apiClient.put<unknown, ApiSuccessResponse<StoreSocialLinkItem>>(
      `${BASE_PATH}/${publicId}/social-links/${linkId}`,
      payload
    );
    return response.data;
  },

  deleteSocialLink: async (publicId: string, linkId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${publicId}/social-links/${linkId}`);
  },

  // ─── Offers ────────────────────────────────────────────────────────────
  getOffers: async (publicId: string, page: number = 1): Promise<StoreOffersListResponse> => {
    const response = await apiClient.get<unknown, StoreOffersListResponse>(`${BASE_PATH}/${publicId}/offers`, {
      params: { page },
    });
    return response;
  },

  getOffer: async (publicId: string, offerId: string): Promise<StoreOffer> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<StoreOffer>>(
      `${BASE_PATH}/${publicId}/offers/${offerId}`
    );
    return response.data;
  },

  createOffer: async (publicId: string, payload: StoreOfferPayload): Promise<StoreOffer> => {
    const formData = buildOfferFormData(payload);
    const response = await apiClient.post<unknown, ApiSuccessResponse<StoreOffer>>(
      `${BASE_PATH}/${publicId}/offers`,
      formData
    );
    return response.data;
  },

  updateOffer: async (publicId: string, offerId: string, payload: StoreOfferPayload): Promise<StoreOffer> => {
    // Send PUT with JSON when there is no file upload. When a file is present, use POST with
    // _method=PUT so Laravel can parse the multipart body (PUT bodies aren't parsed by PHP).
    const hasFile = payload.image instanceof File;

    if (hasFile) {
      const formData = buildOfferFormData(payload);
      formData.append("_method", "PUT");
      const response = await apiClient.post<unknown, ApiSuccessResponse<StoreOffer>>(
        `${BASE_PATH}/${publicId}/offers/${offerId}`,
        formData
      );
      return response.data;
    }

    // payload.image is undefined here (no file branch above), so it is dropped during JSON serialization.
    const response = await apiClient.put<unknown, ApiSuccessResponse<StoreOffer>>(
      `${BASE_PATH}/${publicId}/offers/${offerId}`,
      payload
    );
    return response.data;
  },

  deleteOffer: async (publicId: string, offerId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${publicId}/offers/${offerId}`);
  },
};
