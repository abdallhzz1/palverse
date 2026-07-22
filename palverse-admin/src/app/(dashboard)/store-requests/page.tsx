"use client";

import { useStoreRequestsList } from "@/hooks/use-store-requests";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search, Store as StoreIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { RequestStatusBadge } from "@/components/store-requests/request-status-badge";

export default function StoreRequestsPage() {
  const { data, isLoading, error, params, setFilter, refresh } = useStoreRequestsList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">طلبات تسجيل المتاجر (عبر المناديب)</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">مراجعة طلبات التسجيل المرفوعة من قبل مندوبي المبيعات الميدانيين</p>
        </div>
      </div>

      <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-border dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم المحل أو الممثل..."
                className="pr-9 w-full"
                value={params.query || ""}
                onChange={(e) => setFilter("query", e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                className="h-10 px-3 py-2 rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={params.status || ""}
                onChange={(e) => setFilter("status", e.target.value)}
              >
                <option value="">جميع الحالات</option>
                <option value="submitted">مقدم / قيد الانتظار</option>
                <option value="under_review">قيد المراجعة</option>
                <option value="approved">معتمد</option>
                <option value="rejected">مرفوض</option>
                <option value="needs_changes">مطلوب تعديلات</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-muted-foreground bg-muted dark:bg-slate-800/50 uppercase border-b border-border dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">اسم المحل</th>
                <th className="px-6 py-4 font-medium">الممثل (مقدم الطلب)</th>
                <th className="px-6 py-4 font-medium">المدينة والتصنيف</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">تاريخ الطلب</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div><div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div><div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p>حدث خطأ أثناء جلب البيانات</p>
                    <button onClick={refresh} className="mt-2 text-emerald-600 hover:underline">إعادة المحاولة</button>
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <StoreIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد طلبات تسجيل مطابقة</p>
                  </td>
                </tr>
              ) : (
                data?.data.map((request) => (
                  <tr key={request.public_id} className="hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground dark:text-white">
                        {request.store_name_ar || request.proposed_merchant_name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span dir="ltr">#{request.public_id.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{request.representative?.name || "غير متوفر"}</div>
                      <div className="text-xs text-muted-foreground mt-1 text-left" dir="ltr">{request.representative?.phone || request.phone || "---"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{request.city ? request.city.name_ar : <span className="text-muted-foreground text-xs">غير محدد</span>}</div>
                      <div className="text-xs text-muted-foreground mt-1">{request.category ? request.category.name_ar : <span className="text-muted-foreground text-xs">غير محدد</span>}</div>
                    </td>
                    <td className="px-6 py-4">
                      <RequestStatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <span dir="ltr">{new Date(request.created_at).toLocaleDateString("en-GB")}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/store-requests/${request.public_id}`}
                        className="inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-medium bg-card dark:bg-slate-800 border border-border dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-muted dark:hover:bg-slate-700 transition-colors"
                      >
                        مراجعة الطلب
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !error && data?.meta && (
          <div className="p-4 border-t border-border dark:border-slate-800">
            <Pagination 
              currentPage={data.meta.current_page}
              totalPages={data.meta.last_page}
              onPageChange={(page) => setFilter("page", page)} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
