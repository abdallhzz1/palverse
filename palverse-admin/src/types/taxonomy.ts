import { PaginatedApiSuccessResponse } from "./api";

// ─── Categories ──────────────────────────────────────────────────────────────

export interface Category {
  public_id: string;
  name_ar: string;
  name_en: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriesListParams {
  page?: number;
  per_page?: number;
}

export type CategoriesListResponse = PaginatedApiSuccessResponse<Category>;

export interface CreateCategoryRequest {
  name_ar: string;
  name_en?: string | null;
  slug?: string | null;
}

export interface UpdateCategoryRequest {
  name_ar?: string;
  name_en?: string | null;
}


// ─── Cities ──────────────────────────────────────────────────────────────────

export interface City {
  public_id: string;
  name_ar: string;
  name_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface CitiesListParams {
  page?: number;
  per_page?: number;
}

export type CitiesListResponse = PaginatedApiSuccessResponse<City>;

export interface CreateCityRequest {
  name_ar: string;
  name_en?: string | null;
}

export interface UpdateCityRequest {
  name_ar?: string;
  name_en?: string | null;
}


// ─── Zones ───────────────────────────────────────────────────────────────────

export interface Zone {
  public_id: string;
  name_ar: string;
  name_en: string | null;
  city?: City; // Passed as nested object by backend
  created_at: string;
  updated_at: string;
}

export interface ZonesListParams {
  city?: string; // city_public_id
  page?: number;
  per_page?: number;
}

export type ZonesListResponse = PaginatedApiSuccessResponse<Zone>;

export interface CreateZoneRequest {
  city_id: number; // NOTE: Backend requires numeric ID, but frontend can't safely provide it
  name_ar: string;
  name_en?: string | null;
}

export interface UpdateZoneRequest {
  name_ar?: string;
  name_en?: string | null;
}
