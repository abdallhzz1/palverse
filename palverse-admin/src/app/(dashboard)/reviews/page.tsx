"use client";

import { useReviewsList } from "@/hooks/use-reviews";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search, Star, MessageSquare } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

function ReviewStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "قيد المراجعة", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500" },
    published: { label: "منشور", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500" },
    rejected: { label: "مرفوض", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500" },
    hidden: { label: "مخفي", className: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400" },
  };

  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center" dir="ltr">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 dark:text-slate-700"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { data, meta, isLoading, params, setFilter } = useReviewsList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">إدارة التقييمات</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">مراجعة تقييمات العملاء واعتمادها</p>
        </div>
      </div>

      <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-border dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن متجر أو تعليق..."
                className="pr-9 w-full"
                value={params.search || ""}
                onChange={(e) => setFilter("search", e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                className="h-10 px-3 py-2 rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={params.status || ""}
                onChange={(e) => setFilter("status", e.target.value)}
              >
                <option value="">جميع الحالات</option>
                <option value="pending">قيد المراجعة</option>
                <option value="published">منشور</option>
                <option value="rejected">مرفوض</option>
                <option value="hidden">مخفي</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-muted-foreground bg-muted dark:bg-slate-800/50 uppercase border-b border-border dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">التقييم</th>
                <th className="px-6 py-4 font-medium">المتجر</th>
                <th className="px-6 py-4 font-medium">المستخدم</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p>لا توجد تقييمات مطابقة للبحث</p>
                  </td>
                </tr>
              ) : (
                data.map((review) => (
                  <tr key={review.public_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <RatingStars rating={review.rating} />
                        {review.comment && (
                          <span className="text-xs text-muted-foreground max-w-[200px] truncate block mt-1" title={review.comment}>
                            {review.comment}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/stores/${review.store.public_id}`} className="font-medium hover:text-emerald-600 hover:underline">
                        {review.store.name_ar}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{review.reviewer_name || "زائر"}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(review.created_at), "dd MMM yyyy", { locale: ar })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <ReviewStatusBadge status={review.status} />
                        {review.is_reported && (
                          <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200" title={`سبب الإبلاغ: ${review.report_reason || 'غير محدد'}`}>
                            مُبلّغ عنه
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/reviews/${review.public_id}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        عرض ومراجعة
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-border dark:border-slate-800">
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              onPageChange={(page) => setFilter("page", page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
