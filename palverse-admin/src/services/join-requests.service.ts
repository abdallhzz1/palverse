import { apiClient } from "@/lib/api/client";
import { PaginatedResponse } from "@/types/api";

export interface MerchantJoinRequest {
  public_id: string;
  merchant_name: string;
  store_name: string;
  phone: string;
  email?: string;
  status: string;
  notes?: string;
  created_at: string;
  city: {
    public_id: string;
    name_ar: string;
  } | null;
}

export const joinRequestsService = {
  async getRequests(params?: { page?: number; status?: string }): Promise<PaginatedResponse<MerchantJoinRequest>> {
    const response = await apiClient.get<unknown, PaginatedResponse<MerchantJoinRequest>>('/admin/join-requests', { params });
    return response;
  },

  async updateStatus(id: string, payload: { status: string; password?: string; subscription_plan_id?: string; email?: string }): Promise<void> {
    await apiClient.put(`/admin/join-requests/${id}/status`, payload);
  },

  async getRequest(id: string): Promise<MerchantJoinRequest> {
    const response = await apiClient.get<unknown, { data: MerchantJoinRequest }>(`/admin/join-requests/${id}`);
    return response.data;
  }
};
