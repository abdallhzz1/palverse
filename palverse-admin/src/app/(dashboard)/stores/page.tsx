"use client";

import { useStoresList } from "@/hooks/use-stores";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search, Store as StoreIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { StoreStatusBadge } from "@/components/stores/store-status-badge";
import { StoreVisibilityBadge } from "@/components/stores/store-visibility-badge";

export default function StoresPage() {
  const { data, isLoading, error, params, setFilter, refresh } = useStoresList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">إدارة المحلات</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">عرض وإدارة المحلات واعتمادها أو رفضها</p>
        </div>
      </div>

      <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-border dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم المحل أو المالك أو المعرف..."
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
                <option value="">جميع حالات المراجعة</option>
                <option value="pending">قيد المراجعة</option>
                <option value="approved">معتمد</option>
                <option value="rejected">مرفوض</option>
              </select>

              <select
                className="h-10 px-3 py-2 rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={params.is_active === true ? "true" : params.is_active === false ? "false" : ""}
                onChange={(e) => setFilter("is_active", e.target.value === "" ? "" : e.target.value === "true")}
              >
                <option value="">جميع حالات التفعيل</option>
                <option value="true">نشط</option>
                <option value="false">غير نشط</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-muted-foreground bg-muted dark:bg-slate-800/50 uppercase border-b border-border dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">المحل</th>
                <th className="px-6 py-4 font-medium">المالك</th>
                <th className="px-6 py-4 font-medium">المدينة والتصنيف</th>
                <th className="px-6 py-4 font-medium">حالة المراجعة</th>
                <th className="px-6 py-4 font-medium">الظهور العام</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-700"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p>حدث خطأ أثناء جلب البيانات</p>
                    <button onClick={refresh} className="mt-2 text-emerald-600 hover:underline">
                      إعادة المحاولة
                    </button>
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <StoreIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد محلات مطابقة للبحث</p>
                  </td>
                </tr>
              ) : (
                data?.data.map((store) => (
                  <tr key={store.public_id} className="hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-border dark:border-slate-700 overflow-hidden bg-muted dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {store.logo ? (
                            <img src={store.logo.url} alt={store.name_ar} className="w-full h-full object-cover" />
                          ) : (
                            <StoreIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground dark:text-white">
                            {store.name_ar}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <span dir="ltr">#{store.public_id.substring(0, 8)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {store.owner ? (
                        <>
                          <div className="font-medium">{store.owner.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{store.owner.email}</div>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-xs">غير متوفر</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{store.city ? store.city.name_ar : <span className="text-muted-foreground text-xs">غير محدد</span>}</div>
                      <div className="text-xs text-muted-foreground mt-1">{store.category ? store.category.name_ar : <span className="text-muted-foreground text-xs">غير محدد</span>}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StoreStatusBadge status={store.status} />
                    </td>
                    <td className="px-6 py-4">
                      <StoreVisibilityBadge store={store} showAssignAction />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link 
                          href={`/stores/${store.public_id}`}
                          className="inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-medium bg-card dark:bg-slate-800 border border-border dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-muted dark:hover:bg-slate-700 transition-colors"
                        >
                          عرض التفاصيل
                        </Link>
                        {store.status === "approved" && store.is_active && store.has_active_subscription === false && (
                          <Link
                            href={`/subscriptions/new?store_public_id=${encodeURIComponent(store.public_id)}`}
                            className="inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-medium bg-[#EAF3EC] text-[#0F3D2E] border border-[#1E7D4E]/20 hover:bg-[#dcefe1] transition-colors"
                          >
                            تعيين اشتراك
                          </Link>
                        )}
                      </div>
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
