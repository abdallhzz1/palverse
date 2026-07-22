import { apiClient } from "@/lib/api/client";
import { PaginatedResponse } from "@/types/api";

export interface Zone {
  public_id: string;
  name_ar: string;
}

export interface Representative {
  public_id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  employee_code?: string;
  profile_status?: string;
  active_zones: Zone[];
}

export const representativesService = {
  async getRepresentatives(params?: { page?: number; query?: string; status?: string }): Promise<PaginatedResponse<Representative>> {
    const response = await apiClient.get<unknown, PaginatedResponse<Representative>>('/admin/representatives', { params });
    return response;
  },

  async getRepresentative(id: string): Promise<Representative> {
    const response = await apiClient.get<unknown, { data: Representative }>(`/admin/representatives/${id}`);
    return response.data;
  },

  async createRepresentative(data: any): Promise<void> {
    await apiClient.post('/admin/representatives', data);
  },

  async updateRepresentative(id: string, data: any): Promise<void> {
    await apiClient.put(`/admin/representatives/${id}`, data);
  },

  async assignZones(id: string, zonePublicIds: string[]): Promise<void> {
    await apiClient.post(`/admin/representatives/${id}/assign-zones`, { zone_public_ids: zonePublicIds });
  }
};
