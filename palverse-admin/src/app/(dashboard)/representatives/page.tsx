"use client";

import { useRepresentativesList } from "@/hooks/use-representatives";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, AlertCircle, MapPin, Plus } from "lucide-react";
import Link from "next/link";

export default function RepresentativesPage() {
  const { data, isLoading, error, params, setFilter, refresh } = useRepresentativesList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">إدارة المناديب</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">إدارة مندوبي المبيعات وتعيين مناطق العمل لهم</p>
        </div>
        <Link 
          href="/representatives/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          إضافة مندوب جديد
        </Link>
      </div>

      <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-border dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم المندوب أو رقم الهاتف..."
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
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="suspended">موقوف</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-muted-foreground bg-muted dark:bg-slate-800/50 uppercase border-b border-border dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">اسم المندوب</th>
                <th className="px-6 py-4 font-medium">رقم الموظف</th>
                <th className="px-6 py-4 font-medium">مناطق العمل</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
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
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p>حدث خطأ أثناء جلب البيانات</p>
                    <button onClick={refresh} className="mt-2 text-emerald-600 hover:underline">إعادة المحاولة</button>
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لا يوجد مناديب مطابقين للبحث</p>
                  </td>
                </tr>
              ) : (
                data?.data.map((rep) => (
                  <tr key={rep.public_id} className="hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground dark:text-white">
                        {rep.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 text-left" dir="ltr">
                        {rep.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-muted-foreground">{rep.employee_code || "---"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {rep.active_zones.length > 0 ? (
                          rep.active_zones.map(zone => (
                            <span key={zone.public_id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-500/20">
                              <MapPin className="w-3 h-3" />
                              {zone.name_ar}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">لم يتم تعيين مناطق</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rep.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' :
                        rep.status === 'suspended' ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
                      }`}>
                        {rep.status === 'active' ? 'نشط' : rep.status === 'suspended' ? 'موقوف' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/representatives/${rep.public_id}`}
                        className="inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-medium bg-card dark:bg-slate-800 border border-border dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-muted dark:hover:bg-slate-700 transition-colors"
                      >
                        إدارة وتعديل
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
