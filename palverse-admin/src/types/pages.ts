import { PaginatedApiSuccessResponse, ApiSuccessResponse, PaginationMeta } from "./api";

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
  sort_order: number;
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface PagesListParams {
  page?: number;
  per_page?: number;
  query?: string;
  is_published?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
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
  sort_order?: number;
  seo_title_ar?: string | null;
  seo_title_en?: string | null;
  seo_description_ar?: string | null;
  seo_description_en?: string | null;
}

export type UpdatePageRequest = CreatePageRequest;
