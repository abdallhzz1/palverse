import { apiClient } from "@/lib/api/client";
import { ApiSuccessResponse } from "@/types/api";
import {
  City,
  CitiesListParams,
  CitiesListResponse,
  CreateCityRequest,
  UpdateCityRequest,
  ZonesListResponse,
} from "@/types/taxonomy";

const BASE_PATH = "/admin/cities";

export const citiesService = {
  list: async (params?: CitiesListParams): Promise<CitiesListResponse> => {
    const cleanParams = params 
      ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null))
      : undefined;
      
    const response = await apiClient.get<unknown, CitiesListResponse>(BASE_PATH, { params: cleanParams });
    return response;
  },

  getByPublicId: async (publicId: string): Promise<City> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<City>>(`${BASE_PATH}/${publicId}`);
    return response.data;
  },

  create: async (payload: CreateCityRequest): Promise<City> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<City>>(BASE_PATH, payload);
    return response.data;
  },

  update: async (publicId: string, payload: UpdateCityRequest): Promise<City> => {
    const response = await apiClient.put<unknown, ApiSuccessResponse<City>>(`${BASE_PATH}/${publicId}`, payload);
    return response.data;
  },

  delete: async (publicId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${publicId}`);
  },

  listZones: async (publicId: string): Promise<ZonesListResponse> => {
    // Note: the zones endpoint under city doesn't seem to be paginated in the backend test/impl, 
    // it returns all zones for the city directly. But we use ZonesListResponse mapping to it.
    const response = await apiClient.get<unknown, ZonesListResponse>(`${BASE_PATH}/${publicId}/zones`);
    return response;
  },
};
