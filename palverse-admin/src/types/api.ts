export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMetaLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationMetaLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface PaginatedApiSuccessResponse<T> {
  success?: boolean;
  message?: string;
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthUser {
  public_id: string;
  name: string;
  email: string;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  device_name?: string;
}

export interface BackendLoginData {
  token: string;
  token_type: string;
  user: AuthUser;
}

export interface BackendMeData {
  user: AuthUser;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: AuthUser;
}
