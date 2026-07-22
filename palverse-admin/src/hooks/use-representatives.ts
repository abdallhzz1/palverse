import { useState, useCallback, useEffect } from "react";
import { representativesService, Representative } from "@/services/representatives.service";
import { PaginatedResponse } from "@/types/api";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";

export function useRepresentativesList() {
  const [params, setParams] = useState({ page: 1, query: "", status: "" });
  const [data, setData] = useState<PaginatedResponse<Representative> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchReps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await representativesService.getRepresentatives(params);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchReps();
  }, [fetchReps]);

  const setFilter = useCallback((key: string, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value, ...(key !== "page" ? { page: 1 } : {}) }));
  }, []);

  return {
    data,
    isLoading,
    error,
    params,
    setFilter,
    refresh: fetchReps,
  };
}

export function useRepresentative(id: string | null) {
  const [data, setData] = useState<Representative | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchRep = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await representativesService.getRepresentative(id);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRep();
  }, [fetchRep]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchRep,
  };
}
