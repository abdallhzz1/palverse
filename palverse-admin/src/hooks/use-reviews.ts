import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api/client";

export interface Review {
  public_id: string;
  store: {
    public_id: string;
    name_ar: string;
    name_en: string;
  };
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  status: "pending" | "published" | "rejected" | "hidden";
  published_at: string | null;
  hidden_at: string | null;
  created_at: string;
  is_reported: boolean;
  report_reason: string | null;
  reported_at: string | null;
  reviewer_token_hint?: string;
  moderator?: {
    name: string;
  };
}

interface Meta {
  current_page: number;
  last_page: number;
  total: number;
}

export function useReviewsList() {
  const [data, setData] = useState<Review[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState({
    page: 1,
    status: "",
    search: "",
  });

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      searchParams.set("page", params.page.toString());
      if (params.status) searchParams.set("status", params.status);
      if (params.search) searchParams.set("search", params.search);

      const response: any = await apiClient.get(`/admin/reviews?${searchParams.toString()}`);
      setData(response.data || []);
      setMeta({
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
        total: response.total || 0,
      });
    } catch (err: any) {
      console.error("Failed to fetch reviews:", err);
      setError(err.message || "فشل تحميل التقييمات");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const setFilter = (key: string, value: string | number) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? (value as number) : 1,
    }));
  };

  return {
    data,
    meta,
    isLoading,
    error,
    params,
    setFilter,
    refresh: fetchReviews,
  };
}
