import { useState, useCallback, useEffect } from "react";
import { commissionsService, Commission } from "@/services/commissions.service";
import { PaginatedResponse } from "@/types/api";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";

export function useCommissionsList() {
  const [params, setParams] = useState({ page: 1, status: "", representative_id: "" });
  const [data, setData] = useState<PaginatedResponse<Commission> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchCommissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await commissionsService.getCommissions(params);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const setFilter = useCallback((key: string, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value, ...(key !== "page" ? { page: 1 } : {}) }));
  }, []);

  return {
    data,
    isLoading,
    error,
    params,
    setFilter,
    refresh: fetchCommissions,
  };
}
