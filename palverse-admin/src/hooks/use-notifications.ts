import { useState, useEffect, useCallback } from "react";
import { notificationsService } from "@/services/notifications.service";
import { NotificationsListParams, NotificationsListResponse, NotificationType } from "@/types/notifications";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useNotificationsList(initialParams: NotificationsListParams = { page: 1, per_page: 20 }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<NotificationsListParams>(() => {
    const urlParams: NotificationsListParams = { ...initialParams };
    
    if (searchParams.has("type")) {
      const type = searchParams.get("type");
      if (type) urlParams.type = type as NotificationType;
    }
    if (searchParams.has("unread")) {
      urlParams.unread = searchParams.get("unread") === "true";
    }
    if (searchParams.has("page")) urlParams.page = parseInt(searchParams.get("page")!, 10);
    
    return urlParams;
  });

  const [data, setData] = useState<NotificationsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  // Sync params to URL
  useEffect(() => {
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
  }, [params, pathname, router, searchParams]);

  const fetchNotifications = useCallback(async (currentParams: NotificationsListParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationsService.list(currentParams);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchNotifications(params);
  }, [params, fetchNotifications]);

  const setFilter = useCallback((key: keyof NotificationsListParams, value: string | boolean | number) => {
    setParams(prev => {
      const newParams = { ...prev, [key]: value };
      if (key !== "page") newParams.page = 1;
      return newParams;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setParams(prev => ({ page: 1, per_page: prev.per_page }));
  }, []);

  return { 
    data, 
    isLoading, 
    error, 
    params, 
    setFilter, 
    clearFilters, 
    refresh: () => fetchNotifications(params) 
  };
}

export function useNotificationActions() {
  const [isMarking, setIsMarking] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const markAsRead = async (id: string, onSuccess?: () => void) => {
    setIsMarking(id);
    try {
      await notificationsService.markAsRead(id);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error marking as read
    } finally {
      setIsMarking(null);
    }
  };

  const markAllAsRead = async (onSuccess?: () => void) => {
    setIsMarkingAll(true);
    try {
      await notificationsService.markAllAsRead();
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error marking all as read
    } finally {
      setIsMarkingAll(false);
    }
  };

  return { markAsRead, markAllAsRead, isMarking, isMarkingAll };
}
