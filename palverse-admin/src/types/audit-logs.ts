import { PaginatedApiSuccessResponse, ApiSuccessResponse } from "./api";

export interface AuditActor {
  type: "system" | "user" | "admin" | "merchant" | string;
  public_id: string | null;
  name: string | null;
  email: string | null;
}

export interface AuditSubject {
  type: string;
  public_id: string | null;
  label: string | null;
}

export interface AuditLog {
  public_id: string;
  action: string;
  actor: AuditActor | null;
  subject: AuditSubject | null;
  route: string | null;
  method: string | null;
  ip_address: string | null;
  user_agent: string | null;
  request_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogsListParams {
  page?: number;
  per_page?: number;
  query?: string;
  action?: string;
  actor_public_id?: string;
  subject_type?: string;
  subject_public_id?: string;
  request_id?: string;
  created_from?: string;
  created_to?: string;
  sort?: "newest" | "oldest";
}

export type AuditLogsListResponse = PaginatedApiSuccessResponse<AuditLog>;
export type AuditLogResponse = ApiSuccessResponse<AuditLog>;
