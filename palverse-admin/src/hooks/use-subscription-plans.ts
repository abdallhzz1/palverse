import { useState, useEffect, useCallback } from "react";
import { subscriptionPlansService } from "@/services/subscription-plans.service";
import {
  SubscriptionPlan,
  SubscriptionPlansListParams,
  SubscriptionPlansListResponse,
  StoreSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from "@/types/subscription-plans";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function useSubscriptionPlansList(initialParams: SubscriptionPlansListParams = { page: 1, per_page: 15 }, syncUrl: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<SubscriptionPlansListParams>(() => {
    const urlParams: SubscriptionPlansListParams = { ...initialParams };
    if (syncUrl) {
      if (searchParams.has("page")) urlParams.page = parseInt(searchParams.get("page")!, 10);
      if (searchParams.has("query")) urlParams.query = searchParams.get("query")!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (searchParams.has("status")) urlParams.status = searchParams.get("status") as any;
    }
    return urlParams;
  });

  const [data, setData] = useState<SubscriptionPlansListResponse | null>(null);
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

  const fetchPlans = useCallback(async (currentParams: SubscriptionPlansListParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await subscriptionPlansService.list(currentParams);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchPlans(params);
  }, [params, fetchPlans]);

  const setFilter = useCallback((key: keyof SubscriptionPlansListParams, value: string | number | boolean) => {
    setParams(prev => {
      const newParams = { ...prev, [key]: value };
      if (key !== "page") newParams.page = 1;
      return newParams;
    });
  }, []);

  return { data, isLoading, error, params, setFilter, refresh: () => fetchPlans(params) };
}

export function useSubscriptionPlanDetails(publicId: string) {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchPlan = useCallback(async (isSilent = false) => {
    if (!publicId) return;
    if (!isSilent) setIsLoading(true);
    setError(null);
    try {
      const data = await subscriptionPlansService.getByPublicId(publicId);
      setPlan(data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchPlan();
  }, [fetchPlan]);

  return { plan, isLoading, error, refresh: () => fetchPlan(true) };
}

export function useSubscriptionPlanActions(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const create = async (payload: StoreSubscriptionPlanRequest) => {
    setIsSubmitting(true);
    try {
      const data = await subscriptionPlansService.create(payload);
      toast.success("تم إنشاء خطة الاشتراك بنجاح");
      if (onSuccess) onSuccess();
      return data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message);
      throw normalized; // Throw so form can handle field errors
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = async (publicId: string, payload: UpdateSubscriptionPlanRequest) => {
    setIsSubmitting(true);
    try {
      const data = await subscriptionPlansService.update(publicId, payload);
      toast.success("تم تحديث خطة الاشتراك بنجاح");
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

  const remove = async (publicId: string) => {
    setIsSubmitting(true);
    try {
      await subscriptionPlansService.delete(publicId);
      toast.success("تم حذف خطة الاشتراك بنجاح");
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      // Check for conflict 409
      if (normalized.message.toLowerCase().includes("conflict") || normalized.message.includes("اشتراكات")) {
        toast.error("لا يمكن حذف الخطة لوجود اشتراكات مرتبطة بها");
      } else {
        toast.error(normalized.message);
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const activate = async (publicId: string) => {
    return update(publicId, { is_active: true });
  };

  const deactivate = async (publicId: string) => {
    return update(publicId, { is_active: false });
  };

  return { create, update, remove, activate, deactivate, isSubmitting };
}
