import { PaginatedApiSuccessResponse, ApiSuccessResponse } from "./api";

export interface StaticPage {
  public_id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  is_published: boolean;
  published_at: string | null;
  sort_order: number | null;
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface PagesListParams {
  query?: string;
  is_published?: boolean | string;
  sort?: "sort_order" | "created_at" | "title_ar" | "title_en";
  direction?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export type PagesListResponse = PaginatedApiSuccessResponse<StaticPage>;
export type PageResponse = ApiSuccessResponse<StaticPage>;

export interface CreatePageRequest {
  slug: string;
  title_ar: string;
  title_en?: string | null;
  content_ar: string;
  content_en?: string | null;
  excerpt_ar?: string | null;
  excerpt_en?: string | null;
  is_published?: boolean;
  published_at?: string | null;
  sort_order?: number | null;
  seo_title_ar?: string | null;
  seo_title_en?: string | null;
  seo_description_ar?: string | null;
  seo_description_en?: string | null;
}

export type UpdatePageRequest = Partial<CreatePageRequest>;
