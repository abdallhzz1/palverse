import { apiClient } from "@/lib/api/client";
import { ApiSuccessResponse } from "@/types/api";
import {
  StoreSubscription,
  StoreSubscriptionsListParams,
  StoreSubscriptionsListResponse,
  AssignStoreSubscriptionRequest,
  CancelStoreSubscriptionRequest,
} from "@/types/subscriptions";

const BASE_URL = "/admin/subscriptions";

export const subscriptionsService = {
  async list(params?: StoreSubscriptionsListParams): Promise<StoreSubscriptionsListResponse> {
    const response = await apiClient.get<unknown, StoreSubscriptionsListResponse>(BASE_URL, { params });
    return response;
  },

  async getByPublicId(publicId: string): Promise<StoreSubscription> {
    const response = await apiClient.get<unknown, ApiSuccessResponse<StoreSubscription>>(`${BASE_URL}/${publicId}`);
    return response.data;
  },

  async assign(payload: AssignStoreSubscriptionRequest): Promise<StoreSubscription> {
    const response = await apiClient.post<unknown, ApiSuccessResponse<StoreSubscription>>(`${BASE_URL}/assign`, payload);
    return response.data;
  },

  async cancel(publicId: string, payload: CancelStoreSubscriptionRequest): Promise<StoreSubscription> {
    const response = await apiClient.patch<unknown, ApiSuccessResponse<StoreSubscription>>(`${BASE_URL}/${publicId}/cancel`, payload);
    return response.data;
  },

  async getStoreHistory(storePublicId: string, page = 1, perPage = 15): Promise<StoreSubscriptionsListResponse> {
    const response = await apiClient.get<unknown, StoreSubscriptionsListResponse>(`/admin/stores/${storePublicId}/subscriptions`, {
      params: { page, per_page: perPage }
    });
    return response;
  },
};
