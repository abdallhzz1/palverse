import { useState, useCallback, useEffect } from "react";
import { joinRequestsService, MerchantJoinRequest } from "@/services/join-requests.service";
import { PaginatedResponse } from "@/types/api";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";

export function useJoinRequestsList() {
  const [params, setParams] = useState({ page: 1, status: "" });
  const [data, setData] = useState<PaginatedResponse<MerchantJoinRequest> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await joinRequestsService.getRequests(params);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const setFilter = useCallback((key: string, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value, ...(key !== "page" ? { page: 1 } : {}) }));
  }, []);

  return {
    data,
    isLoading,
    error,
    params,
    setFilter,
    refresh: fetchRequests,
  };
}
