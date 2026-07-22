import { useState, useEffect, useCallback } from "react";
import { zonesService } from "@/services/zones.service";
import { Zone, ZonesListParams, ZonesListResponse, CreateZoneRequest, UpdateZoneRequest } from "@/types/taxonomy";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function useZonesList(initialParams: ZonesListParams = { page: 1, per_page: 15 }, syncUrl: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<ZonesListParams>(() => {
    const urlParams: ZonesListParams = { ...initialParams };
    if (syncUrl && searchParams.has("page")) urlParams.page = parseInt(searchParams.get("page")!, 10);
    if (syncUrl && searchParams.has("city")) urlParams.city = searchParams.get("city")!;
    return urlParams;
  });

  const [data, setData] = useState<ZonesListResponse | null>(null);
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

  const fetchZones = useCallback(async (currentParams: ZonesListParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await zonesService.list(currentParams);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchZones(params);
  }, [params, fetchZones]);

  const setFilter = useCallback((key: keyof ZonesListParams, value: string | number) => {
    setParams(prev => {
      const newParams = { ...prev, [key]: value };
      if (key !== "page") newParams.page = 1;
      return newParams;
    });
  }, []);

  return { data, isLoading, error, params, setFilter, refresh: () => fetchZones(params) };
}

export function useZoneDetails(publicId: string) {
  const [zone, setZone] = useState<Zone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchZone = useCallback(async (isSilent = false) => {
    if (!publicId) return;
    if (!isSilent) setIsLoading(true);
    setError(null);
    try {
      const data = await zonesService.getByPublicId(publicId);
      setZone(data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchZone();
  }, [fetchZone]);

  return { zone, isLoading, error, refresh: () => fetchZone(true) };
}

export function useZoneActions(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const create = async (payload: CreateZoneRequest) => {
    setIsSubmitting(true);
    try {
      const data = await zonesService.create(payload);
      toast.success("تم إنشاء المنطقة بنجاح");
      if (onSuccess) onSuccess();
      return data;
    } catch (err) {
      toast.error(normalizeApiError(err).message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = async (publicId: string, payload: UpdateZoneRequest) => {
    setIsSubmitting(true);
    try {
      const data = await zonesService.update(publicId, payload);
      toast.success("تم تحديث المنطقة بنجاح");
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
      await zonesService.delete(publicId);
      toast.success("تم حذف المنطقة بنجاح");
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      const apiError = normalizeApiError(err);
      if (apiError.status === 409) {
        toast.error(apiError.message || "لا يمكن حذف المنطقة لارتباطها במחلات");
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
