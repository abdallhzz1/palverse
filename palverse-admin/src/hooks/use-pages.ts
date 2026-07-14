import { useState, useCallback, useEffect } from "react";
import { pagesService } from "@/services/pages.service";
import { StaticPage, PagesListParams, CreatePageRequest, UpdatePageRequest, PagesListResponse } from "@/types/pages";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { toast } from "sonner";

export function usePagesList(params: PagesListParams = {}) {
  const [data, setData] = useState<PagesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await pagesService.list(params);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchPages,
  };
}

export function usePageDetails(publicId: string | null) {
  const [data, setData] = useState<StaticPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchPage = useCallback(async () => {
    if (!publicId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await pagesService.get(publicId);
      setData(response.data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchPage,
  };
}

export function usePageActions() {
  const [isMutating, setIsMutating] = useState(false);
  const [apiError, setApiError] = useState<NormalizedApiError | null>(null);

  const createPage = async (payload: CreatePageRequest, onSuccess?: (page: StaticPage) => void) => {
    setIsMutating(true);
    setApiError(null);
    try {
      const res = await pagesService.create(payload);
      toast.success("تم إنشاء الصفحة بنجاح");
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) {
      setApiError(normalizeApiError(err));
      return null;
    } finally {
      setIsMutating(false);
    }
  };

  const updatePage = async (publicId: string, payload: UpdatePageRequest, onSuccess?: (page: StaticPage) => void) => {
    setIsMutating(true);
    setApiError(null);
    try {
      const res = await pagesService.update(publicId, payload);
      toast.success("تم تحديث الصفحة بنجاح");
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) {
      setApiError(normalizeApiError(err));
      return null;
    } finally {
      setIsMutating(false);
    }
  };

  const deletePage = async (publicId: string, onSuccess?: () => void) => {
    setIsMutating(true);
    setApiError(null);
    try {
      await pagesService.delete(publicId);
      toast.success("تم حذف الصفحة بنجاح");
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      setApiError(normalizeApiError(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const publishPage = async (publicId: string, onSuccess?: () => void) => {
    setIsMutating(true);
    setApiError(null);
    try {
      await pagesService.publish(publicId);
      toast.success("تم نشر الصفحة بنجاح");
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      setApiError(normalizeApiError(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const unpublishPage = async (publicId: string, onSuccess?: () => void) => {
    setIsMutating(true);
    setApiError(null);
    try {
      await pagesService.unpublish(publicId);
      toast.success("تم إلغاء نشر الصفحة بنجاح");
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      setApiError(normalizeApiError(err));
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    createPage,
    updatePage,
    deletePage,
    publishPage,
    unpublishPage,
    isMutating,
    apiError,
  };
}
