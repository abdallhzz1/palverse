"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { RatingStarsDisplay } from "./RatingStarsDisplay";
import { Loader2 } from "lucide-react";

interface Review {
  public_id: string;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  published_at: string | null;
}

interface ReviewListProps {
  storeSlug: string;
}

export function ReviewList({ storeSlug }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchReviews = async (pageNum: number) => {
    try {
      setLoading(true);
      const res: any = await apiClient.get(`/stores/${encodeURIComponent(storeSlug)}/reviews?page=${pageNum}`);
      const newReviews = res.data || [];
      const meta = {
        current_page: res.current_page || 1,
        last_page: res.last_page || 1,
        total: res.total || 0,
      };
      
      if (pageNum === 1) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }
      
      if (meta && meta.current_page < meta.last_page) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [storeSlug]);

  if (loading && reviews.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[#1E7D4E]" /></div>;
  }

  if (reviews.length === 0) {
    return null; // Empty state is handled by RatingSummary
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-bold text-[#0F3D2E] font-heading">تقييمات العملاء</h3>
      
      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div key={review.public_id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-bold text-[#0F3D2E]">
                  {review.reviewer_name || "زائر"}
                </span>
                <span className="text-xs text-gray-400">
                  {review.published_at ? new Date(review.published_at).toLocaleDateString("ar-SA") : ""}
                </span>
              </div>
              <RatingStarsDisplay rating={review.rating} size={16} />
            </div>
            
            {review.comment && (
              <p className="text-[#7FA789] whitespace-pre-wrap text-sm leading-relaxed">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => {
            setPage(p => p + 1);
            fetchReviews(page + 1);
          }}
          disabled={loading}
          className="mx-auto border border-[#1E7D4E] text-[#1E7D4E] hover:bg-[#EAF3EC] font-bold py-2 px-6 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? "جاري التحميل..." : "عرض المزيد"}
        </button>
      )}
    </div>
  );
}
