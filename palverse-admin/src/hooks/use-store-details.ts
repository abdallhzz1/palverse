import { useState, useEffect, useCallback } from "react";
import { storesService } from "@/services/stores.service";
import { AdminStore, RejectStoreRequest, StoreSubscriptionsListResponse } from "@/types/store";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { toast } from "sonner";

export function useStoreDetails(publicId: string) {
  const [store, setStore] = useState<AdminStore | null>(null);
  const [subscriptions, setSubscriptions] = useState<StoreSubscriptionsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchStore = useCallback(async (isSilent = false) => {
    if (!publicId) return;
    
    if (!isSilent) setIsLoading(true);
    setError(null);

    try {
      const [storeData, subsData] = await Promise.all([
        storesService.getByPublicId(publicId),
        storesService.getSubscriptions(publicId).catch(() => null) // Ignore subscription fetch errors to keep store details working
      ]);
      setStore(storeData);
      setSubscriptions(subsData);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      if (!publicId) return;
      setIsLoading(true);
      setError(null);
      try {
        const [storeData, subsData] = await Promise.all([
          storesService.getByPublicId(publicId),
          storesService.getSubscriptions(publicId).catch(() => null)
        ]);
        if (isMounted) {
          setStore(storeData);
          setSubscriptions(subsData);
        }
      } catch (err) {
        if (isMounted) setError(normalizeApiError(err));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [publicId]);

  return {
    store,
    subscriptions,
    isLoading,
    error,
    refresh: () => fetchStore(true),
  };
}

export function useStoreActions(publicId: string, onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withToastAndRefresh = async (action: () => Promise<unknown>, successMessage: string) => {
    setIsSubmitting(true);
    try {
      await action();
      toast.success(successMessage);
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      const error = normalizeApiError(err);
      toast.error(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const approve = () => 
    withToastAndRefresh(() => storesService.approve(publicId), "تم اعتماد المتجر بنجاح");

  const reject = (payload: RejectStoreRequest) => 
    withToastAndRefresh(() => storesService.reject(publicId, payload), "تم رفض المتجر بنجاح");

  const activate = () => 
    withToastAndRefresh(() => storesService.activate(publicId), "تم تفعيل المتجر بنجاح");

  const deactivate = () => 
    withToastAndRefresh(() => storesService.deactivate(publicId), "تم تعطيل المتجر بنجاح");

  return {
    approve,
    reject,
    activate,
    deactivate,
    isSubmitting,
  };
}
