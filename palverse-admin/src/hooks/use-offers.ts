import { useState, useEffect, useCallback } from "react";
import { offersService } from "@/services/offers.service";
import { AdminOffer, OffersListParams, OffersListResponse } from "@/types/offers";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function useOffersList(initialParams: OffersListParams = { page: 1, per_page: 15 }, syncUrl: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<OffersListParams>(() => {
    const urlParams: OffersListParams = { ...initialParams };
    if (syncUrl) {
      if (searchParams.has("page")) urlParams.page = parseInt(searchParams.get("page")!, 10);
      if (searchParams.has("query")) urlParams.query = searchParams.get("query")!;
      if (searchParams.has("is_active")) urlParams.is_active = searchParams.get("is_active")!;
      if (searchParams.has("valid_now")) urlParams.valid_now = searchParams.get("valid_now")!;
      if (searchParams.has("store_public_id")) urlParams.store_public_id = searchParams.get("store_public_id")!;
    }
    return urlParams;
  });

  const [data, setData] = useState<OffersListResponse | null>(null);
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

  const fetchOffers = useCallback(async (currentParams: OffersListParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await offersService.list(currentParams);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchOffers(params);
  }, [params, fetchOffers]);

  const setFilter = (key: keyof OffersListParams, value: string | number | boolean) => {
    setParams(prev => {
      const newParams = { ...prev, [key]: value };
      if (key !== "page") newParams.page = 1;
      return newParams;
    });
  };

  return { data, isLoading, error, params, setFilter, refresh: () => fetchOffers(params) };
}

export function useOfferDetails(publicId: string) {
  const [offer, setOffer] = useState<AdminOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchOffer = useCallback(async (isSilent = false) => {
    if (!publicId) return;
    if (!isSilent) setIsLoading(true);
    setError(null);
    try {
      const data = await offersService.getByPublicId(publicId);
      setOffer(data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchOffer();
  }, [fetchOffer]);

  return { offer, isLoading, error, refresh: () => fetchOffer(true) };
}

export function useOfferActions(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activate = async (publicId: string) => {
    setIsSubmitting(true);
    try {
      const data = await offersService.activate(publicId);
      toast.success("تم تفعيل العرض بنجاح");
      if (onSuccess) onSuccess();
      return data;
    } catch (err) {
      toast.error(normalizeApiError(err).message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deactivate = async (publicId: string) => {
    setIsSubmitting(true);
    try {
      const data = await offersService.deactivate(publicId);
      toast.success("تم تعطيل العرض بنجاح");
      if (onSuccess) onSuccess();
      return data;
    } catch (err) {
      toast.error(normalizeApiError(err).message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { activate, deactivate, isSubmitting };
}
