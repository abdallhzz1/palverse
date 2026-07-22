"use client";

import { useState, useEffect } from "react";
import { RatingStarsInput } from "./RatingStarsInput";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  storeSlug: string;
}

function generateVisitorToken() {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("palverse_visitor_token");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("palverse_visitor_token", token);
    }
    return token;
  }
  return "";
}

export function ReviewForm({ storeSlug }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Read status from localStorage if we already submitted a review
  useEffect(() => {
    if (typeof window !== "undefined") {
      const submitted = localStorage.getItem(`palverse_reviewed_${storeSlug}`);
      if (submitted) {
        setIsSubmitted(true);
      }
    }
  }, [storeSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("يرجى اختيار التقييم أولاً");
      return;
    }

    setIsSubmitting(true);
    const token = generateVisitorToken();

    try {
      await apiClient.post(`/stores/${encodeURIComponent(storeSlug)}/reviews`, {
        rating,
        reviewer_name: name || null,
        comment: comment || null,
      }, {
        headers: {
          "X-Visitor-Token": token
        }
      });

      toast.success("تم استلام تقييمك بنجاح وسيظهر بعد المراجعة.");
      setIsSubmitted(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(`palverse_reviewed_${storeSlug}`, "true");
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("لقد قمت بتقييم هذا المتجر مسبقاً.");
        setIsSubmitted(true);
      } else if (error.response?.status === 429) {
        toast.error("لقد تجاوزت الحد المسموح للتقييمات. يرجى المحاولة لاحقاً.");
      } else if (error.response?.status === 422) {
        toast.error("تأكد من إدخال البيانات بشكل صحيح.");
      } else {
        toast.error("حدث خطأ أثناء إرسال التقييم.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-[#EAF3EC] text-[#1E7D4E] p-6 rounded-2xl text-center border border-[#1E7D4E]/20">
        <h3 className="text-xl font-bold mb-2">شكراً لتقييمك!</h3>
        <p>تم استلام تقييمك وسيظهر بعد مراجعته من قبل الإدارة.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-[#0F3D2E] font-heading">قيّم هذا المحل</h3>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">اختر عدد النجوم *</label>
        <RatingStarsInput value={rating} onChange={setRating} disabled={isSubmitting} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reviewerName" className="text-sm font-medium text-gray-700">الاسم (اختياري)</label>
        <input
          id="reviewerName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اكتب اسمك ليظهر في التقييم"
          disabled={isSubmitting}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] transition-all"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="comment" className="text-sm font-medium text-gray-700">اكتب تجربتك (اختياري)</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="كيف كانت تجربتك مع هذا المتجر؟"
          disabled={isSubmitting}
          rows={4}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full bg-[#1E7D4E] hover:bg-[#145C3A] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          "إرسال التقييم"
        )}
      </button>
    </form>
  );
}
