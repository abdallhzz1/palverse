import { apiClient } from "@/lib/api/client";
import {
  FaqsListParams,
  FaqsListResponse,
  FaqResponse,
  CreateFaqRequest,
  UpdateFaqRequest,
} from "@/types/faqs";
import { ApiSuccessResponse } from "@/types/api";

const BASE_PATH = "/admin/faqs";

export const faqsService = {
  list: async (params?: FaqsListParams): Promise<FaqsListResponse> => {
    return apiClient.get<unknown, FaqsListResponse>(BASE_PATH, { params });
  },

  get: async (publicId: string): Promise<FaqResponse> => {
    return apiClient.get<unknown, FaqResponse>(`${BASE_PATH}/${publicId}`);
  },

  create: async (payload: CreateFaqRequest): Promise<FaqResponse> => {
    return apiClient.post<unknown, FaqResponse>(BASE_PATH, payload);
  },

  update: async (publicId: string, payload: UpdateFaqRequest): Promise<FaqResponse> => {
    return apiClient.put<unknown, FaqResponse>(`${BASE_PATH}/${publicId}`, payload);
  },

  delete: async (publicId: string): Promise<ApiSuccessResponse<[]>> => {
    return apiClient.delete<unknown, ApiSuccessResponse<[]>>(`${BASE_PATH}/${publicId}`);
  },
};
