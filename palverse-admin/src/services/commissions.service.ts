import { apiClient } from "@/lib/api/client";
import { PaginatedResponse } from "@/types/api";

export interface Commission {
  public_id: string;
  amount: number;
  type: string;
  status: string;
  notes?: string;
  created_at: string;
  paid_at?: string;
  representative: {
    public_id: string;
    name: string;
  } | null;
  store: {
    public_id: string;
    name_ar: string;
  } | null;
}

export const commissionsService = {
  async getCommissions(params?: { page?: number; status?: string; representative_id?: string }): Promise<PaginatedResponse<Commission>> {
    const response = await apiClient.get<unknown, PaginatedResponse<Commission>>('/admin/commissions', { params });
    return response;
  },

  async markAsPaid(id: string): Promise<void> {
    await apiClient.post(`/admin/commissions/${id}/pay`);
  }
};
