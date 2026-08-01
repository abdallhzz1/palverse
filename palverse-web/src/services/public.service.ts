import { apiClient } from "@/lib/api/client";
import type { BaseResponse } from "@/types/auth";

export type SearchSuggestion = {
  type: "store" | "category" | "city" | "zone";
  public_id?: string | null;
  slug?: string | null;
  label_ar?: string | null;
  label_en?: string | null;
  secondary_label_ar?: string | null;
  secondary_label_en?: string | null;
  url?: string | null;
};

export const publicService = {
  async getCategories() {
    const res = await apiClient.get<never, BaseResponse<any>>("/categories");
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

  async getSearchSuggestions(query: string, limit = 8) {
    const res = await apiClient.get<never, BaseResponse<SearchSuggestion[]>>("/search/suggestions", {
      params: {
        query,
        limit,
        types: "stores,categories,cities,zones",
      },
    });
    return Array.isArray(res.data) ? res.data : [];
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
