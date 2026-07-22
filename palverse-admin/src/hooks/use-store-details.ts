import { useState, useEffect, useCallback } from "react";
import { storesService } from "@/services/stores.service";
import { AdminStore, RejectStoreRequest, StoreSubscriptionsListResponse, UpdateAdminStoreRequest } from "@/types/store";
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
    withToastAndRefresh(() => storesService.approve(publicId), "تم اعتماد المحل بنجاح");

  const reject = (payload: RejectStoreRequest) => 
    withToastAndRefresh(() => storesService.reject(publicId, payload), "تم رفض المحل بنجاح");

  const activate = () => 
    withToastAndRefresh(() => storesService.activate(publicId), "تم تفعيل المحل بنجاح");

  const deactivate = () => 
    withToastAndRefresh(() => storesService.deactivate(publicId), "تم تعطيل المحل بنجاح");

  return {
    approve,
    reject,
    activate,
    deactivate,
    isSubmitting,
  };
}

export function useStoreUpdate(publicId: string, onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<NormalizedApiError | null>(null);

  const update = async (payload: UpdateAdminStoreRequest) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const data = await storesService.update(publicId, payload);
      toast.success("تم تحديث بيانات المحل بنجاح");
      if (onSuccess) onSuccess();
      return data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      setApiError(normalized);
      toast.error(normalized.message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { update, isSubmitting, apiError };
}

export function useStoreMedia(publicId: string, onSuccess?: () => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const run = async (
    action: () => Promise<unknown>,
    successMessage: string,
    setLoading: (v: boolean) => void
  ) => {
    setLoading(true);
    try {
      await action();
      toast.success(successMessage);
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      toast.error(normalizeApiError(err).message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = (file: File) =>
    run(() => storesService.uploadLogo(publicId, file), "تم رفع الشعار بنجاح", setIsUploading);
  const uploadCover = (file: File) =>
    run(() => storesService.uploadCover(publicId, file), "تم رفع صورة الغلاف بنجاح", setIsUploading);
  const uploadGallery = (file: File) =>
    run(() => storesService.uploadGallery(publicId, file), "تم إضافة الصورة إلى المعرض بنجاح", setIsUploading);
  const deleteLogo = () =>
    run(() => storesService.deleteLogo(publicId), "تم حذف الشعار بنجاح", setIsDeleting);
  const deleteCover = () =>
    run(() => storesService.deleteCover(publicId), "تم حذف صورة الغلاف بنجاح", setIsDeleting);
  const deleteGallery = (mediaId: string) =>
    run(() => storesService.deleteGallery(publicId, mediaId), "تم حذف الصورة بنجاح", setIsDeleting);

  return {
    uploadLogo,
    uploadCover,
    uploadGallery,
    deleteLogo,
    deleteCover,
    deleteGallery,
    isUploading,
    isDeleting,
  };
}
