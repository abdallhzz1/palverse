import { apiClient } from "@/lib/api/client";
import { AdminOffer, OffersListParams, OffersListResponse } from "@/types/offers";
import { ApiSuccessResponse } from "@/types/api";

const OFFERS_URL = "/admin/offers";

export const offersService = {
  async list(params?: OffersListParams): Promise<OffersListResponse> {
    const response = await apiClient.get<unknown, OffersListResponse>(OFFERS_URL, { params });
    return response;
  },

  async getByPublicId(publicId: string): Promise<AdminOffer> {
    const response = await apiClient.get<unknown, ApiSuccessResponse<AdminOffer>>(`${OFFERS_URL}/${publicId}`);
    return response.data;
  },

  async activate(publicId: string): Promise<AdminOffer> {
    const response = await apiClient.patch<unknown, ApiSuccessResponse<AdminOffer>>(`${OFFERS_URL}/${publicId}/activate`);
    return response.data;
  },

  async deactivate(publicId: string): Promise<AdminOffer> {
    const response = await apiClient.patch<unknown, ApiSuccessResponse<AdminOffer>>(`${OFFERS_URL}/${publicId}/deactivate`);
    return response.data;
  },
};
