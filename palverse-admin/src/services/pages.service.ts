import { apiClient } from "@/lib/api/client";
import {
  PagesListParams,
  PagesListResponse,
  PageResponse,
  CreatePageRequest,
  UpdatePageRequest,
} from "@/types/pages";
import { ApiSuccessResponse } from "@/types/api";

const BASE_PATH = "/admin/pages";

export const pagesService = {
  list: async (params?: PagesListParams): Promise<PagesListResponse> => {
    return apiClient.get<unknown, PagesListResponse>(BASE_PATH, { params });
  },

  get: async (publicId: string): Promise<PageResponse> => {
    return apiClient.get<unknown, PageResponse>(`${BASE_PATH}/${publicId}`);
  },

  create: async (payload: CreatePageRequest): Promise<PageResponse> => {
    return apiClient.post<unknown, PageResponse>(BASE_PATH, payload);
  },

  update: async (publicId: string, payload: UpdatePageRequest): Promise<PageResponse> => {
    return apiClient.put<unknown, PageResponse>(`${BASE_PATH}/${publicId}`, payload);
  },

  delete: async (publicId: string): Promise<ApiSuccessResponse<[]>> => {
    return apiClient.delete<unknown, ApiSuccessResponse<[]>>(`${BASE_PATH}/${publicId}`);
  },

  publish: async (publicId: string): Promise<PageResponse> => {
    return apiClient.patch<unknown, PageResponse>(`${BASE_PATH}/${publicId}/publish`);
  },

  unpublish: async (publicId: string): Promise<PageResponse> => {
    return apiClient.patch<unknown, PageResponse>(`${BASE_PATH}/${publicId}/unpublish`);
  },
};
