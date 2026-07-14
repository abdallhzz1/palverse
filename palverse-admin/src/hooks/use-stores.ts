import { useState, useEffect, useCallback } from "react";
import { storesService } from "@/services/stores.service";
import { AdminStore, StoresListParams, StoresListResponse } from "@/types/store";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useStoresList(initialParams: StoresListParams = { page: 1, per_page: 15 }, syncUrl: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL if present, otherwise fallback to initialParams
  const [params, setParams] = useState<StoresListParams>(() => {
    const urlParams: StoresListParams = { ...initialParams };
    
    if (syncUrl) {
      if (searchParams.has("query")) urlParams.query = searchParams.get("query")!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (searchParams.has("status")) urlParams.status = searchParams.get("status") as any;
      if (searchParams.has("is_active")) urlParams.is_active = searchParams.get("is_active") === "true";
      if (searchParams.has("page")) urlParams.page = parseInt(searchParams.get("page")!, 10);
    }
    
    return urlParams;
  });

  const [data, setData] = useState<StoresListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  // Sync params to URL
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

  const fetchStores = useCallback(async (currentParams: StoresListParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await storesService.list(currentParams);
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
        const response = await storesService.list(params);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setFilter = useCallback((key: keyof StoresListParams, value: any) => {
    setParams(prev => {
      const newParams = { ...prev, [key]: value };
      if (key !== "page") {
        newParams.page = 1; // Reset page on filter change
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
    refresh: () => fetchStores(params),
  };
}
