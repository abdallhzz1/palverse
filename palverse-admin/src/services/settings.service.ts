import { apiClient } from "@/lib/api/client";
import {
  SettingsResponse,
  SettingsGroupResponse,
  UpdateSettingsRequest,
  UpdateSettingsGroupRequest,
  SettingsGroupName,
} from "@/types/settings";
import { ApiSuccessResponse } from "@/types/api";

const BASE_PATH = "/admin/settings";

export const settingsService = {
  getAll: async (): Promise<SettingsResponse> => {
    return apiClient.get<unknown, SettingsResponse>(BASE_PATH);
  },

  getGroup: async (group: SettingsGroupName): Promise<SettingsGroupResponse> => {
    return apiClient.get<unknown, SettingsGroupResponse>(`${BASE_PATH}/${group}`);
  },

  updateAll: async (payload: UpdateSettingsRequest): Promise<ApiSuccessResponse<[]>> => {
    return apiClient.put<unknown, ApiSuccessResponse<[]>>(BASE_PATH, payload);
  },

  updateGroup: async (group: SettingsGroupName, payload: UpdateSettingsGroupRequest): Promise<ApiSuccessResponse<[]>> => {
    return apiClient.put<unknown, ApiSuccessResponse<[]>>(`${BASE_PATH}/${group}`, payload);
  },
};
