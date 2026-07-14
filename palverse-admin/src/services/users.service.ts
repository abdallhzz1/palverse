import { apiClient } from "@/lib/api/client";
import {
  ManagedUser,
  UsersListParams,
  UsersListResponse,
  CreateMerchantRequest,
  UpdateUserRequest,
  DeactivateUserRequest,
  SuspendUserRequest,
  UpdateUserRolesRequest,
  ResetUserPasswordRequest,
  UserStoresResponse,
  UserSubscriptionsResponse,
} from "@/types/user";
import { ApiSuccessResponse } from "@/types/api";

const BASE_PATH = "/admin/users";

export const usersService = {
  list: async (params: UsersListParams): Promise<UsersListResponse> => {
    // Remove empty parameters to keep the URL clean and avoid confusing the backend
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
    );
    const response = await apiClient.get<unknown, UsersListResponse>(BASE_PATH, { params: cleanParams });
    return response;
  },

  createMerchant: async (payload: CreateMerchantRequest): Promise<ManagedUser> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<ManagedUser>>(`${BASE_PATH}/merchants`, payload);
    return response.data;
  },

  getByPublicId: async (publicId: string): Promise<ManagedUser> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<ManagedUser>>(`${BASE_PATH}/${publicId}`);
    return response.data;
  },

  update: async (publicId: string, payload: UpdateUserRequest): Promise<ManagedUser> => {
    const response = await apiClient.put<unknown, ApiSuccessResponse<ManagedUser>>(`${BASE_PATH}/${publicId}`, payload);
    return response.data;
  },

  activate: async (publicId: string): Promise<ManagedUser> => {
    const response = await apiClient.patch<unknown, ApiSuccessResponse<ManagedUser>>(`${BASE_PATH}/${publicId}/activate`);
    return response.data;
  },

  deactivate: async (publicId: string, payload: DeactivateUserRequest): Promise<ManagedUser> => {
    const response = await apiClient.patch<unknown, ApiSuccessResponse<ManagedUser>>(`${BASE_PATH}/${publicId}/deactivate`, payload);
    return response.data;
  },

  suspend: async (publicId: string, payload: SuspendUserRequest): Promise<ManagedUser> => {
    const response = await apiClient.patch<unknown, ApiSuccessResponse<ManagedUser>>(`${BASE_PATH}/${publicId}/suspend`, payload);
    return response.data;
  },

  updateRoles: async (publicId: string, payload: UpdateUserRolesRequest): Promise<string[]> => {
    const response = await apiClient.patch<unknown, ApiSuccessResponse<string[]>>(`${BASE_PATH}/${publicId}/roles`, payload);
    return response.data;
  },

  revokeTokens: async (publicId: string): Promise<{ revoked_count: number }> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<{ revoked_count: number }>>(`${BASE_PATH}/${publicId}/revoke-tokens`);
    return response.data;
  },

  resetPassword: async (publicId: string, payload: ResetUserPasswordRequest): Promise<null> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<null>>(`${BASE_PATH}/${publicId}/reset-password`, payload);
    return response.data;
  },

  listStores: async (publicId: string, page = 1, perPage = 15): Promise<UserStoresResponse> => {
    const response = await apiClient.get<unknown, UserStoresResponse>(`${BASE_PATH}/${publicId}/stores`, {
      params: { page, per_page: perPage },
    });
    return response;
  },

  listSubscriptions: async (publicId: string, page = 1, perPage = 15): Promise<UserSubscriptionsResponse> => {
    const response = await apiClient.get<unknown, UserSubscriptionsResponse>(`${BASE_PATH}/${publicId}/subscriptions`, {
      params: { page, per_page: perPage },
    });
    return response;
  },
};
