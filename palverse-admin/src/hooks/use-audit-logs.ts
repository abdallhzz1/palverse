import { useState, useCallback, useEffect } from "react";
import { auditLogsService } from "@/services/audit-logs.service";
import { AuditLog, AuditLogsListParams, AuditLogsListResponse } from "@/types/audit-logs";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";

export function useAuditLogsList(params: AuditLogsListParams = {}) {
  const [data, setData] = useState<AuditLogsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await auditLogsService.list(params);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchLogs,
  };
}

export function useAuditLogDetails(publicId: string | null) {
  const [data, setData] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchLog = useCallback(async () => {
    if (!publicId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await auditLogsService.getByPublicId(publicId);
      setData(response.data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLog();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLog]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchLog,
  };
}
