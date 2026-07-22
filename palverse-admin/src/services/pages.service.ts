import { apiClient } from "@/lib/api/client";
import {
  PagesListParams,
  PagesListResponse,
  PageResponse,
  CreatePageRequest,
  UpdatePageRequest,
  StaticPage,
} from "@/types/pages";
import { ApiSuccessResponse } from "@/types/api";

const BASE_PATH = "/admin/pages";

export const pagesService = {
  list: async (params?: PagesListParams): Promise<PagesListResponse> => {
    const cleanParams = params
      ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null))
      : undefined;
    return apiClient.get<unknown, PagesListResponse>(BASE_PATH, { params: cleanParams });
  },

  get: async (publicId: string): Promise<StaticPage> => {
    const response = await apiClient.get<unknown, PageResponse>(`${BASE_PATH}/${publicId}`);
    return response.data;
  },

  create: async (payload: CreatePageRequest): Promise<StaticPage> => {
    const response = await apiClient.post<unknown, PageResponse>(BASE_PATH, payload);
    return response.data;
  },

  update: async (publicId: string, payload: UpdatePageRequest): Promise<StaticPage> => {
    const response = await apiClient.put<unknown, PageResponse>(`${BASE_PATH}/${publicId}`, payload);
    return response.data;
  },

  delete: async (publicId: string): Promise<ApiSuccessResponse<[]>> => {
    return apiClient.delete<unknown, ApiSuccessResponse<[]>>(`${BASE_PATH}/${publicId}`);
  },

  publish: async (publicId: string): Promise<StaticPage> => {
    const response = await apiClient.patch<unknown, PageResponse>(`${BASE_PATH}/${publicId}/publish`);
    return response.data;
  },

  unpublish: async (publicId: string): Promise<StaticPage> => {
    const response = await apiClient.patch<unknown, PageResponse>(`${BASE_PATH}/${publicId}/unpublish`);
    return response.data;
  },
};
