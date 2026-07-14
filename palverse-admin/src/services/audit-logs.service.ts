import { apiClient } from "@/lib/api/client";
import {
  AuditLogsListParams,
  AuditLogsListResponse,
  AuditLogResponse,
} from "@/types/audit-logs";

const BASE_PATH = "/admin/audit-logs";

export const auditLogsService = {
  list: async (params?: AuditLogsListParams): Promise<AuditLogsListResponse> => {
    // Remove empty parameters to keep the URL clean
    const cleanParams = params
      ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null))
      : {};
    return apiClient.get<unknown, AuditLogsListResponse>(BASE_PATH, { params: cleanParams });
  },

  getByPublicId: async (publicId: string): Promise<AuditLogResponse> => {
    return apiClient.get<unknown, AuditLogResponse>(`${BASE_PATH}/${publicId}`);
  },
};
