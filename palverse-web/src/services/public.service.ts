import { apiClient } from "@/lib/api/client";
import type { BaseResponse } from "@/types/auth";

export const publicService = {
  async getCategories() {
    const res = await apiClient.get<never, BaseResponse<any>>("/categories");
    // API might return data as Paginated or direct array. Assuming PaginatedData based on other endpoints, but Categories could be flat. Let's return raw res.data.
    return res.data;
  },

  async getCities() {
    const res = await apiClient.get<never, BaseResponse<any>>("/cities");
    return res.data;
  },

  async getZones(cityPublicId: string) {
    const res = await apiClient.get<never, BaseResponse<any>>(`/cities/${cityPublicId}/zones`);
    return res.data;
  },

  async getOffers(page: number = 1, perPage: number = 15) {
    const res = await apiClient.get<never, any>(`/offers?page=${page}&per_page=${perPage}`);
    return res;
  },

  async getPages() {
    const res = await apiClient.get<never, BaseResponse<any>>("/pages");
    return res.data;
  },

  async getPage(slug: string) {
    const res = await apiClient.get<never, BaseResponse<any>>(`/pages/${slug}`);
    return res.data;
  },
};
