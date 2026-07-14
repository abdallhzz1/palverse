import { PaginatedApiSuccessResponse, ApiSuccessResponse, PaginationMeta } from "./api";

export interface Faq {
  public_id: string;
  question_ar: string;
  question_en: string | null;
  answer_ar: string;
  answer_en: string | null;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqsListParams {
  page?: number;
  per_page?: number;
  query?: string;
  category?: string;
  is_active?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
}

export type FaqsListResponse = PaginatedApiSuccessResponse<Faq>;
export type FaqResponse = ApiSuccessResponse<Faq>;

export interface CreateFaqRequest {
  question_ar: string;
  question_en?: string | null;
  answer_ar: string;
  answer_en?: string | null;
  category?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export type UpdateFaqRequest = CreateFaqRequest;
