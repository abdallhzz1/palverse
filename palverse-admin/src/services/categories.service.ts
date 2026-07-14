import { apiClient } from "@/lib/api/client";
import { ApiSuccessResponse } from "@/types/api";
import {
  Category,
  CategoriesListParams,
  CategoriesListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/taxonomy";

const BASE_PATH = "/admin/categories";

export const categoriesService = {
  list: async (params?: CategoriesListParams): Promise<CategoriesListResponse> => {
    const cleanParams = params 
      ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null))
      : undefined;
      
    const response = await apiClient.get<unknown, CategoriesListResponse>(BASE_PATH, { params: cleanParams });
    return response;
  },

  getByPublicId: async (publicId: string): Promise<Category> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<Category>>(`${BASE_PATH}/${publicId}`);
    return response.data;
  },

  create: async (payload: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<unknown, ApiSuccessResponse<Category>>(BASE_PATH, payload);
    return response.data;
  },

  update: async (publicId: string, payload: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<unknown, ApiSuccessResponse<Category>>(`${BASE_PATH}/${publicId}`, payload);
    return response.data;
  },

  delete: async (publicId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${publicId}`);
  },
};
