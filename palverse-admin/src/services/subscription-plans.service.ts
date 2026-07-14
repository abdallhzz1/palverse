import { apiClient } from "@/lib/api/client";
import { ApiSuccessResponse } from "@/types/api";
import {
  SubscriptionPlan,
  SubscriptionPlansListParams,
  SubscriptionPlansListResponse,
  StoreSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from "@/types/subscription-plans";

const PLANS_URL = "/admin/subscription-plans";

export const subscriptionPlansService = {
  async list(params?: SubscriptionPlansListParams): Promise<SubscriptionPlansListResponse> {
    const response = await apiClient.get<unknown, SubscriptionPlansListResponse>(PLANS_URL, { params });
    return response;
  },

  async getByPublicId(publicId: string): Promise<SubscriptionPlan> {
    const response = await apiClient.get<unknown, ApiSuccessResponse<SubscriptionPlan>>(`${PLANS_URL}/${publicId}`);
    return response.data;
  },

  async create(payload: StoreSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    const response = await apiClient.post<unknown, ApiSuccessResponse<SubscriptionPlan>>(PLANS_URL, payload);
    return response.data;
  },

  async update(publicId: string, payload: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    const response = await apiClient.put<unknown, ApiSuccessResponse<SubscriptionPlan>>(`${PLANS_URL}/${publicId}`, payload);
    return response.data;
  },

  async delete(publicId: string): Promise<void> {
    await apiClient.delete(`${PLANS_URL}/${publicId}`);
  },
};
