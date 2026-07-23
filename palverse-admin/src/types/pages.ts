import { PaginatedApiSuccessResponse, ApiSuccessResponse } from "./api";

export type StaticPageType = "content" | "contact";

export type StaticPageMeta = {
  hero_eyebrow_ar?: string | null;
  hero_eyebrow_en?: string | null;
  info_card_title_ar?: string | null;
  info_card_title_en?: string | null;
  phone?: string | null;
  phone_label_ar?: string | null;
  phone_label_en?: string | null;
  phone_hint_ar?: string | null;
  phone_hint_en?: string | null;
  email?: string | null;
  email_label_ar?: string | null;
  email_label_en?: string | null;
  email_hint_ar?: string | null;
  email_hint_en?: string | null;
  address_ar?: string | null;
  address_en?: string | null;
  address_line2_ar?: string | null;
  address_line2_en?: string | null;
  address_label_ar?: string | null;
  address_label_en?: string | null;
  whatsapp_number?: string | null;
  form_title_ar?: string | null;
  form_title_en?: string | null;
  submit_label_ar?: string | null;
  submit_label_en?: string | null;
  map_embed_url?: string | null;
  map_lat?: string | null;
  map_lng?: string | null;
};

export interface StaticPage {
  public_id: string;
  slug: string;
  page_type: StaticPageType;
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
  meta: StaticPageMeta | null;
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
  page_type?: StaticPageType;
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
  meta?: StaticPageMeta | null;
}

export type UpdatePageRequest = Partial<CreatePageRequest>;
