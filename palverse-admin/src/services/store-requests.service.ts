import { apiClient } from "@/lib/api/client";
import {
  StoreRegistrationRequest,
  StoreRequestListParams,
  StoreRequestsListResponse
} from "@/types/store-requests";
import { ApiSuccessResponse } from "@/types/api";

const BASE_PATH = "/admin/store-requests";

export const storeRequestsService = {
  list: async (params: StoreRequestListParams): Promise<StoreRequestsListResponse> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
    );
    const response = await apiClient.get<unknown, StoreRequestsListResponse>(BASE_PATH, { params: cleanParams });
    return response;
  },

  getByPublicId: async (publicId: string): Promise<StoreRegistrationRequest> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<StoreRegistrationRequest>>(`${BASE_PATH}/${publicId}`);
    return response.data;
  },

  startReview: async (publicId: string): Promise<StoreRegistrationRequest> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<StoreRegistrationRequest>>(`${BASE_PATH}/${publicId}/review`, { action: "start_review" });
    return response.data;
  },

  approve: async (publicId: string): Promise<StoreRegistrationRequest> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<StoreRegistrationRequest>>(`${BASE_PATH}/${publicId}/review`, { action: "approve" });
    return response.data;
  },

  reject: async (publicId: string, reason: string): Promise<StoreRegistrationRequest> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<StoreRegistrationRequest>>(`${BASE_PATH}/${publicId}/review`, { action: "reject", reason });
    return response.data;
  },

  requestChanges: async (publicId: string, reason: string): Promise<StoreRegistrationRequest> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<StoreRegistrationRequest>>(`${BASE_PATH}/${publicId}/review`, { action: "request_changes", reason });
    return response.data;
  },
};
