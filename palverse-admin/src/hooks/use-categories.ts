import { useState, useEffect, useCallback } from "react";
import { categoriesService } from "@/services/categories.service";
import { Category, CategoriesListParams, CategoriesListResponse, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/taxonomy";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function useCategoriesList(initialParams: CategoriesListParams = { page: 1, per_page: 15 }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<CategoriesListParams>(() => {
    const urlParams: CategoriesListParams = { ...initialParams };
    if (searchParams.has("page")) urlParams.page = parseInt(searchParams.get("page")!, 10);
    return urlParams;
  });

  const [data, setData] = useState<CategoriesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        newSearchParams.set(key, String(value));
      }
    });
    const newQueryString = newSearchParams.toString();
    if (newQueryString !== searchParams.toString()) {
      router.replace(`${pathname}?${newQueryString}`, { scroll: false });
    }
  }, [params, pathname, router]);

  const fetchCategories = useCallback(async (currentParams: CategoriesListParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await categoriesService.list(currentParams);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchCategories(params);
  }, [params, fetchCategories]);

  const setFilter = (key: keyof CategoriesListParams, value: string | number) => {
    setParams(prev => {
      const newParams = { ...prev, [key]: value };
      if (key !== "page") newParams.page = 1;
      return newParams;
    });
  };

  return { data, isLoading, error, params, setFilter, refresh: () => fetchCategories(params) };
}

export function useCategoryDetails(publicId: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchCategory = useCallback(async (isSilent = false) => {
    if (!publicId) return;
    if (!isSilent) setIsLoading(true);
    setError(null);
    try {
      const data = await categoriesService.getByPublicId(publicId);
      setCategory(data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchCategory();
  }, [fetchCategory]);

  return { category, isLoading, error, refresh: () => fetchCategory(true) };
}

export function useCategoryActions(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const create = async (payload: CreateCategoryRequest) => {
    setIsSubmitting(true);
    try {
      const data = await categoriesService.create(payload);
      toast.success("تم إنشاء التصنيف بنجاح");
      if (onSuccess) onSuccess();
      return data;
    } catch (err) {
      toast.error(normalizeApiError(err).message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = async (publicId: string, payload: UpdateCategoryRequest) => {
    setIsSubmitting(true);
    try {
      const data = await categoriesService.update(publicId, payload);
      toast.success("تم تحديث التصنيف بنجاح");
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
      await categoriesService.delete(publicId);
      toast.success("تم حذف التصنيف بنجاح");
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      const apiError = normalizeApiError(err);
      if (apiError.status === 409) {
        toast.error(apiError.message || "لا يمكن حذف التصنيف لارتباطه ببيانات أخرى");
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
