import { useState, useCallback, useEffect } from "react";
import { pagesService } from "@/services/pages.service";
import {
  StaticPage,
  PagesListParams,
  PagesListResponse,
  CreatePageRequest,
  UpdatePageRequest,
} from "@/types/pages";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { toast } from "sonner";

export function usePagesList(params: PagesListParams = {}) {
  const [data, setData] = useState<PagesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const paramsKey = JSON.stringify(params);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPages();
  }, [fetchPages]);

  return { data, isLoading, error, refresh: fetchPages };
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
      const page = await pagesService.get(publicId);
      setData(page);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage();
  }, [fetchPage]);

  return { data, isLoading, error, refresh: fetchPage };
}

export function usePageActions() {
  const [isMutating, setIsMutating] = useState(false);
  const [apiError, setApiError] = useState<NormalizedApiError | null>(null);

  const createPage = async (payload: CreatePageRequest, onSuccess?: (page: StaticPage) => void) => {
    setIsMutating(true);
    setApiError(null);
    try {
      const page = await pagesService.create(payload);
      toast.success("تم إنشاء الصفحة بنجاح");
      if (onSuccess) onSuccess(page);
      return page;
    } catch (err) {
      const normalized = normalizeApiError(err);
      setApiError(normalized);
      toast.error(normalized.message);
      return null;
    } finally {
      setIsMutating(false);
    }
  };

  const updatePage = async (publicId: string, payload: UpdatePageRequest, onSuccess?: (page: StaticPage) => void) => {
    setIsMutating(true);
    setApiError(null);
    try {
      const page = await pagesService.update(publicId, payload);
      toast.success("تم تحديث الصفحة بنجاح");
      if (onSuccess) onSuccess(page);
      return page;
    } catch (err) {
      const normalized = normalizeApiError(err);
      setApiError(normalized);
      toast.error(normalized.message);
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
      const normalized = normalizeApiError(err);
      setApiError(normalized);
      toast.error(normalized.message);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const setPublished = async (publicId: string, publish: boolean, onSuccess?: (page: StaticPage) => void) => {
    setIsMutating(true);
    setApiError(null);
    try {
      const page = publish ? await pagesService.publish(publicId) : await pagesService.unpublish(publicId);
      toast.success(publish ? "تم نشر الصفحة بنجاح" : "تم إلغاء نشر الصفحة بنجاح");
      if (onSuccess) onSuccess(page);
      return page;
    } catch (err) {
      const normalized = normalizeApiError(err);
      setApiError(normalized);
      toast.error(normalized.message);
      return null;
    } finally {
      setIsMutating(false);
    }
  };

  return { createPage, updatePage, deletePage, setPublished, isMutating, apiError };
}
