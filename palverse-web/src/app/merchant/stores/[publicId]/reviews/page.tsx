"use client";

import { useEffect, useState, use } from "react";
import { apiClient } from "@/lib/api/client";
import { RatingStarsDisplay } from "@/components/reviews/RatingStarsDisplay";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Review {
  public_id: string;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  status: "published" | "hidden";
  published_at: string | null;
}

export default function MerchantReviewsPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Reporting state
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reviewsRes, summaryRes] = await Promise.all([
          apiClient.get(`/merchant/stores/${publicId}/reviews`),
          apiClient.get(`/merchant/stores/${publicId}/reviews/summary`)
        ]);
        
        const reviewsData: any = reviewsRes;
        const summaryData: any = summaryRes;

        setReviews(reviewsData.data || reviewsData || []);
        setSummary(summaryData || null);
      } catch (error) {
        console.error("Failed to fetch merchant reviews:", error);
        toast.error("حدث خطأ أثناء تحميل التقييمات.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicId]);

  const handleReport = async () => {
    if (!reportingReviewId || !reportReason.trim()) return;

    try {
      setIsReporting(true);
      await apiClient.post(`/merchant/stores/${publicId}/reviews/${reportingReviewId}/report`, {
        reason: reportReason
      });

      toast.success("تم إرسال البلاغ بنجاح وسيتم مراجعته من قبل الإدارة.");
      
      // Remove the reported review from the list
      setReviews(reviews.filter(r => r.public_id !== reportingReviewId));
      
      // Reset state
      setReportingReviewId(null);
      setReportReason("");
    } catch (error: any) {
      console.error("Failed to report review:", error);
      toast.error(error.message || "حدث خطأ أثناء إرسال البلاغ.");
    } finally {
      setIsReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E7D4E]" />
        <p className="mt-4 text-gray-500">جاري تحميل التقييمات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/merchant/stores/${publicId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] font-heading">تقييمات المتجر</h1>
          <p className="text-[#7FA789] text-sm mt-1">تتبع رأي العملاء وتقييماتهم لمتجرك</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#0F3D2E] mb-6 border-b pb-4">ملخص التقييمات</h2>
        {summary && summary.count > 0 ? (
          <RatingSummary summary={summary} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            لا توجد تقييمات لمتجرك حتى الآن.
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#0F3D2E] mb-6 border-b pb-4">قائمة التقييمات</h2>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد تقييمات لعرضها.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div key={review.public_id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[#0F3D2E]">
                      {review.reviewer_name || "زائر"}
                    </span>
                    <div className="flex items-center gap-2">
                      <RatingStarsDisplay rating={review.rating} size={14} />
                      <span className="text-xs text-gray-400">
                        {review.published_at ? new Date(review.published_at).toLocaleDateString("ar-SA") : ""}
                      </span>
                    </div>
                  </div>
                  {review.status === "hidden" && (
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      مخفي من قبل الإدارة
                    </span>
                  )}
                </div>
                
                {review.comment ? (
                  <p className="text-[#0F3D2E] text-sm whitespace-pre-wrap">
                    {review.comment}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    (لم يترك العميل تعليقاً نصياً)
                  </p>
                )}

                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setReportingReviewId(review.public_id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    إبلاغ عن إساءة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportingReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#0F3D2E] mb-4">الإبلاغ عن تقييم</h3>
            <p className="text-sm text-gray-600 mb-4">
              يرجى توضيح سبب الإبلاغ عن هذا التقييم. سيتم إخفاء التقييم مؤقتاً ومراجعته من قبل الإدارة.
            </p>
            <textarea
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#1E7D4E] focus:outline-none resize-none mb-4"
              rows={4}
              placeholder="اكتب سبب الإبلاغ هنا..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              disabled={isReporting}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setReportingReviewId(null);
                  setReportReason("");
                }}
                disabled={isReporting}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim() || isReporting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isReporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "إرسال البلاغ"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
