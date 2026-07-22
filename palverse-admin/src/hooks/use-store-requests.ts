import { useState, useEffect, useCallback } from "react";
import { storeRequestsService } from "@/services/store-requests.service";
import { StoreRequestListParams, StoreRequestsListResponse, StoreRequestStatus } from "@/types/store-requests";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useStoreRequestsList(initialParams: StoreRequestListParams = { page: 1, per_page: 15 }, syncUrl: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<StoreRequestListParams>(() => {
    const urlParams: StoreRequestListParams = { ...initialParams };
    
    if (syncUrl) {
      if (searchParams.has("query")) urlParams.query = searchParams.get("query")!;
      if (searchParams.has("status")) urlParams.status = searchParams.get("status") as StoreRequestStatus;
      if (searchParams.has("page")) urlParams.page = parseInt(searchParams.get("page")!, 10);
    }
    
    return urlParams;
  });

  const [data, setData] = useState<StoreRequestsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  useEffect(() => {
    if (!syncUrl) return;
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        newSearchParams.set(key, String(value));
      } else {
        newSearchParams.delete(key);
      }
    });

    const newQueryString = newSearchParams.toString();
    if (newQueryString !== searchParams.toString()) {
      router.replace(`${pathname}?${newQueryString}`, { scroll: false });
    }
  }, [params, pathname, router, searchParams, syncUrl]);

  const fetchRequests = useCallback(async (currentParams: StoreRequestListParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await storeRequestsService.list(currentParams);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await storeRequestsService.list(params);
        if (isMounted) setData(response);
      } catch (err) {
        if (isMounted) setError(normalizeApiError(err));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(load, params.query ? 300 : 0);
    
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [params]);

  const setFilter = useCallback((key: keyof StoreRequestListParams, value: unknown) => {
    setParams(prev => {
      const newParams = { ...prev, [key]: value };
      if (key !== "page") {
        newParams.page = 1;
      }
      return newParams;
    });
  }, []);

  return {
    data,
    isLoading,
    error,
    params,
    setFilter,
    refresh: () => fetchRequests(params),
  };
}
