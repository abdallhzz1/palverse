import { useState, useCallback, useEffect } from "react";
import { faqsService } from "@/services/faqs.service";
import { Faq, FaqsListParams, CreateFaqRequest, UpdateFaqRequest, FaqsListResponse } from "@/types/faqs";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { toast } from "sonner";

export function useFaqsList(params: FaqsListParams = {}) {
  const [data, setData] = useState<FaqsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchFaqs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await faqsService.list(params);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchFaqs,
  };
}

export function useFaqDetails(publicId: string | null) {
  const [data, setData] = useState<Faq | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchFaq = useCallback(async () => {
    if (!publicId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await faqsService.get(publicId);
      setData(response.data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    fetchFaq();
  }, [fetchFaq]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchFaq,
  };
}

export function useFaqActions() {
  const [isMutating, setIsMutating] = useState(false);
  const [apiError, setApiError] = useState<NormalizedApiError | null>(null);

  const createFaq = async (payload: CreateFaqRequest, onSuccess?: (faq: Faq) => void) => {
    setIsMutating(true);
    setApiError(null);
    try {
      const res = await faqsService.create(payload);
      toast.success("تم إنشاء السؤال الشائع بنجاح");
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) {
      setApiError(normalizeApiError(err));
      return null;
    } finally {
      setIsMutating(false);
    }
  };

  const updateFaq = async (publicId: string, payload: UpdateFaqRequest, onSuccess?: (faq: Faq) => void) => {
    setIsMutating(true);
    setApiError(null);
    try {
      const res = await faqsService.update(publicId, payload);
      toast.success("تم تحديث السؤال الشائع بنجاح");
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) {
      setApiError(normalizeApiError(err));
      return null;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteFaq = async (publicId: string, onSuccess?: () => void) => {
    setIsMutating(true);
    setApiError(null);
    try {
      await faqsService.delete(publicId);
      toast.success("تم حذف السؤال الشائع بنجاح");
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
    createFaq,
    updateFaq,
    deleteFaq,
    isMutating,
    apiError,
  };
}
