import { apiClient } from "@/lib/api/client";
import { ApiSuccessResponse } from "@/types/api";
import {
  Zone,
  ZonesListParams,
  ZonesListResponse,
  CreateZoneRequest,
  UpdateZoneRequest,
} from "@/types/taxonomy";

const BASE_PATH = "/admin/zones";

export const zonesService = {
  list: async (params?: ZonesListParams): Promise<ZonesListResponse> => {
    const cleanParams = params 
      ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null))
      : undefined;
      
    const response = await apiClient.get<unknown, ZonesListResponse>(BASE_PATH, { params: cleanParams });
    return response;
  },

  getByPublicId: async (publicId: string): Promise<Zone> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<Zone>>(`${BASE_PATH}/${publicId}`);
    return response.data;
  },

  create: async (payload: CreateZoneRequest): Promise<Zone> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<Zone>>(BASE_PATH, payload);
    return response.data;
  },

  update: async (publicId: string, payload: UpdateZoneRequest): Promise<Zone> => {
    const response = await apiClient.put<unknown, ApiSuccessResponse<Zone>>(`${BASE_PATH}/${publicId}`, payload);
    return response.data;
  },

  delete: async (publicId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${publicId}`);
  },
};
