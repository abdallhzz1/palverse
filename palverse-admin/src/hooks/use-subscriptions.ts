import { useState, useEffect, useCallback } from "react";
import { subscriptionsService } from "@/services/subscriptions.service";
import {
  StoreSubscription,
  StoreSubscriptionsListParams,
  StoreSubscriptionsListResponse,
  AssignStoreSubscriptionRequest,
  CancelStoreSubscriptionRequest,
} from "@/types/subscriptions";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function useSubscriptionsList(initialParams: StoreSubscriptionsListParams = { page: 1, per_page: 15 }, syncUrl: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<StoreSubscriptionsListParams>(() => {
    const urlParams: StoreSubscriptionsListParams = { ...initialParams };
    if (syncUrl) {
      if (searchParams.has("page")) urlParams.page = parseInt(searchParams.get("page")!, 10);
      if (searchParams.has("status")) urlParams.status = searchParams.get("status")!;
      if (searchParams.has("store_public_id")) urlParams.store_public_id = searchParams.get("store_public_id")!;
      if (searchParams.has("plan_public_id")) urlParams.plan_public_id = searchParams.get("plan_public_id")!;
      if (searchParams.has("starts_from")) urlParams.starts_from = searchParams.get("starts_from")!;
      if (searchParams.has("starts_to")) urlParams.starts_to = searchParams.get("starts_to")!;
      if (searchParams.has("ends_from")) urlParams.ends_from = searchParams.get("ends_from")!;
      if (searchParams.has("ends_to")) urlParams.ends_to = searchParams.get("ends_to")!;
    }
    return urlParams;
  });

  const [data, setData] = useState<StoreSubscriptionsListResponse | null>(null);
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

  const fetchSubscriptions = useCallback(async (currentParams: StoreSubscriptionsListParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await subscriptionsService.list(currentParams);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchSubscriptions(params);
  }, [params, fetchSubscriptions]);

  const setFilter = useCallback((key: keyof StoreSubscriptionsListParams, value: string | number | boolean) => {
    setParams(prev => {
      const newParams = { ...prev, [key]: value };
      if (key !== "page") newParams.page = 1;
      return newParams;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setParams(prev => ({ page: 1, per_page: prev.per_page }));
  }, []);

  return { data, isLoading, error, params, setFilter, clearFilters, refresh: () => fetchSubscriptions(params) };
}

export function useSubscriptionDetails(publicId: string) {
  const [subscription, setSubscription] = useState<StoreSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchSubscription = useCallback(async (isSilent = false) => {
    if (!publicId) return;
    if (!isSilent) setIsLoading(true);
    setError(null);
    try {
      const data = await subscriptionsService.getByPublicId(publicId);
      setSubscription(data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchSubscription();
  }, [fetchSubscription]);

  return { subscription, isLoading, error, refresh: () => fetchSubscription(true) };
}

export function useSubscriptionActions(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assign = async (payload: AssignStoreSubscriptionRequest) => {
    setIsSubmitting(true);
    try {
      const data = await subscriptionsService.assign(payload);
      toast.success("تم تعيين الاشتراك بنجاح");
      if (onSuccess) onSuccess();
      return data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      if (normalized.code === "STORE_ALREADY_HAS_ACTIVE_SUBSCRIPTION") {
        toast.error("يوجد اشتراك نشط لهذا المحل بالفعل");
      } else {
        toast.error(normalized.message);
      }
      throw normalized;
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancel = async (publicId: string, payload: CancelStoreSubscriptionRequest) => {
    setIsSubmitting(true);
    try {
      const data = await subscriptionsService.cancel(publicId, payload);
      toast.success("تم إلغاء الاشتراك بنجاح");
      if (onSuccess) onSuccess();
      return data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message);
      throw normalized;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { assign, cancel, isSubmitting };
}

export function useStoreSubscriptionHistory(storePublicId: string) {
  const [data, setData] = useState<StoreSubscriptionsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async (currentPage: number) => {
    if (!storePublicId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await subscriptionsService.getStoreHistory(storePublicId, currentPage, 5);
      setData(res);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [storePublicId]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchHistory(page);
  }, [page, fetchHistory]);

  return { data, isLoading, error, page, setPage, refresh: () => fetchHistory(page) };
}
