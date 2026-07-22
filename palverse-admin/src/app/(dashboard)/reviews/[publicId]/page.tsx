"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Review } from "@/hooks/use-reviews";
import { ArrowRight, Star, User, Store, Calendar, ShieldAlert, CheckCircle, XCircle, EyeOff } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

function ReviewStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "قيد المراجعة", className: "bg-yellow-100 text-yellow-800" },
    published: { label: "منشور", className: "bg-emerald-100 text-emerald-800" },
    rejected: { label: "مرفوض", className: "bg-red-100 text-red-800" },
    hidden: { label: "مخفي", className: "bg-slate-100 text-slate-800" },
  };

  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function ReviewDetailPage() {
  const { publicId } = useParams();
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReview = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/admin/reviews/${publicId}`);
      setReview(res.data);
    } catch (err) {
      setError("فشل تحميل التقييم");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [publicId]);

  const handleAction = async (action: "approve" | "reject" | "hide" | "restore") => {
    if (!confirm(`هل أنت متأكد من تنفيذ هذا الإجراء؟`)) return;
    
    try {
      setIsActionLoading(true);
      await apiClient.patch(`/admin/reviews/${publicId}/${action}`);
      await fetchReview(); // refresh
    } catch (err: any) {
      alert(err.response?.data?.message || "فشل تنفيذ الإجراء");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (error || !review) {
    return <div className="text-center p-12 text-red-500 font-bold">{error || "لم يتم العثور على التقييم"}</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/reviews"
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">تفاصيل التقييم</h2>
          <p className="text-sm text-muted-foreground mt-1">معاينة واتخاذ قرار بشأن التقييم</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <ReviewStatusBadge status={review.status} />
              <div className="flex items-center" dir="ltr">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 dark:text-slate-700"}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-2">نص التقييم</h4>
                {review.comment ? (
                  <p className="text-lg leading-relaxed text-slate-800 dark:text-slate-200 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg whitespace-pre-wrap border border-slate-100 dark:border-slate-800">
                    "{review.comment}"
                  </p>
                ) : (
                  <p className="text-slate-400 italic">لم يكتب الزائر تعليقاً نصياً، اكتفى بالنجوم.</p>
                )}
              </div>

              {review.is_reported && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    سبب إبلاغ التاجر
                  </h4>
                  <p className="text-red-900 dark:text-red-300 whitespace-pre-wrap">
                    {review.report_reason || "لا يوجد سبب محدد"}
                  </p>
                  <span className="text-xs text-red-500 dark:text-red-400/70 mt-2 block">
                    تم الإبلاغ في: {review.reported_at ? new Date(review.reported_at).toLocaleString('ar-SA') : "غير محدد"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              قرار المراجعة
            </h3>
            
            <div className="flex flex-wrap gap-3">
              {review.status === "pending" && (
                <>
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={isActionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    الموافقة والنشر
                  </button>
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={isActionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    رفض التقييم
                  </button>
                </>
              )}
              
              {review.status === "published" && (
                <button
                  onClick={() => handleAction("hide")}
                  disabled={isActionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white font-medium rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <EyeOff className="w-4 h-4" />
                  إخفاء التقييم
                </button>
              )}

              {(review.status === "hidden" || review.status === "rejected") && (
                <button
                  onClick={() => handleAction("restore")}
                  disabled={isActionLoading}
                  className="flex items-center gap-2 px-4 py-2 border border-emerald-600 text-emerald-600 font-medium rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  استعادة ونشر
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-6">
          <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg p-6 shadow-sm space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">تفاصيل المتجر</h4>
              <Link href={`/stores/${review.store.public_id}`} className="flex items-start gap-3 group">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-md text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                    {review.store.name_ar}
                  </div>
                  <div className="text-xs text-slate-500 mt-1" dir="ltr">{review.store.public_id}</div>
                </div>
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">الزائر</h4>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {review.reviewer_name || "زائر (لم يدخل اسماً)"}
                  </div>
                  {review.reviewer_token_hint && (
                    <div className="text-xs text-slate-400 mt-1" dir="ltr" title="بصمة المتصفح المجهولة">
                      {review.reviewer_token_hint}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">
                  تم الإرسال: {format(new Date(review.created_at), "dd MMM yyyy, HH:mm", { locale: ar })}
                </span>
              </div>
              {review.published_at && (
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300">
                    تاريخ النشر: {format(new Date(review.published_at), "dd MMM yyyy, HH:mm", { locale: ar })}
                  </span>
                </div>
              )}
              {review.moderator && (
                <div className="flex items-center gap-3 text-sm">
                  <ShieldAlert className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    تمت المراجعة بواسطة: {review.moderator.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
