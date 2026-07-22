import { apiClient } from "@/lib/api/client";
import {
  AdminStore,
  RejectStoreRequest,
  StoreLinksResponse,
  StoreMediaSummary,
  StoresListParams,
  StoresListResponse,
  StoreSubscriptionsListResponse,
  UpdateAdminStoreRequest,
} from "@/types/store";
import { ApiSuccessResponse } from "@/types/api";

const BASE_PATH = "/admin/stores";

export const storesService = {
  list: async (params: StoresListParams): Promise<StoresListResponse> => {
    // Remove empty parameters to keep the URL clean and avoid confusing the backend
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
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
};
