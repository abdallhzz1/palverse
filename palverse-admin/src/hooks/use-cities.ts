import { useState, useEffect, useCallback } from "react";
import { citiesService } from "@/services/cities.service";
import { City, CitiesListParams, CitiesListResponse, CreateCityRequest, UpdateCityRequest } from "@/types/taxonomy";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function useCitiesList(initialParams: CitiesListParams = { page: 1, per_page: 15 }, syncUrl: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<CitiesListParams>(() => {
    const urlParams: CitiesListParams = { ...initialParams };
    if (syncUrl && searchParams.has("page")) urlParams.page = parseInt(searchParams.get("page")!, 10);
    return urlParams;
  });

  const [data, setData] = useState<CitiesListResponse | null>(null);
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

  const fetchCities = useCallback(async (currentParams: CitiesListParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await citiesService.list(currentParams);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchCities(params);
  }, [params, fetchCities]);

  const setFilter = (key: keyof CitiesListParams, value: string | number) => {
    setParams(prev => {
      const newParams = { ...prev, [key]: value };
      if (key !== "page") newParams.page = 1;
      return newParams;
    });
  };

  return { data, isLoading, error, params, setFilter, refresh: () => fetchCities(params) };
}

export function useCityDetails(publicId: string) {
  const [city, setCity] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchCity = useCallback(async (isSilent = false) => {
    if (!publicId) return;
    if (!isSilent) setIsLoading(true);
    setError(null);
    try {
      const data = await citiesService.getByPublicId(publicId);
      setCity(data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchCity();
  }, [fetchCity]);

  return { city, isLoading, error, refresh: () => fetchCity(true) };
}

export function useCityActions(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const create = async (payload: CreateCityRequest) => {
    setIsSubmitting(true);
    try {
      const data = await citiesService.create(payload);
      toast.success("تم إنشاء المدينة بنجاح");
      if (onSuccess) onSuccess();
      return data;
    } catch (err) {
      toast.error(normalizeApiError(err).message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = async (publicId: string, payload: UpdateCityRequest) => {
    setIsSubmitting(true);
    try {
      const data = await citiesService.update(publicId, payload);
      toast.success("تم تحديث المدينة بنجاح");
      if (onSuccess) onSuccess();
      return data;
    } catch (err) {
      toast.error(normalizeApiError(err).message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (publicId: string) => {
    setIsSubmitting(true);
    try {
      await citiesService.delete(publicId);
      toast.success("تم حذف المدينة بنجاح");
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      const apiError = normalizeApiError(err);
      if (apiError.status === 409) {
        toast.error(apiError.message || "لا يمكن حذف المدينة لارتباطها بمناطق أخرى");
      } else {
        toast.error(apiError.message);
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { create, update, remove, isSubmitting };
}
