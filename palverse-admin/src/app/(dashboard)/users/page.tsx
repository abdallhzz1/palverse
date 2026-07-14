"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUsersList } from "@/hooks/use-users";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { UserRoleBadge } from "@/components/users/user-role-badge";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils/formatters";
import { Search, Plus, UserCircle, MoreVertical, RefreshCw, AlertTriangle } from "lucide-react";
import { UserStatus, UserRole } from "@/types/user";

export default function UsersPage() {
  const { data, isLoading, error, filters, setFilter, refresh } = useUsersList();
  
  // Local state for debounced search
  const [searchTerm, setSearchTerm] = useState(filters.query || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.query) {
        setFilter("query", searchTerm);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.query, setFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">المستخدمون والتجار</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">إدارة حسابات المستخدمين والتجار وصلاحياتهم</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={refresh} 
            variant="outline" 
            size="icon" 
            disabled={isLoading}
            className="h-10 w-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2522]"
            aria-label="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/users/new">
            <Button className="bg-[#1E7D4E] hover:bg-[#1E7D4E]/90 text-white gap-2">
              <Plus className="w-4 h-4" />
              <span>إضافة تاجر</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 shadow-sm flex flex-col">
        
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              type="text" 
              placeholder="ابحث بالاسم أو البريد أو رقم الهاتف" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status || ""}
              onChange={(e) => setFilter("status", e.target.value as UserStatus | "")}
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="suspended">موقوف</option>
            </select>

            <select
              value={filters.role || ""}
              onChange={(e) => setFilter("role", e.target.value as UserRole | "")}
              className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
            >
              <option value="">جميع الأدوار</option>
              <option value="admin">مدير</option>
              <option value="merchant">تاجر</option>
              <option value="customer">مستخدم</option>
            </select>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto min-h-[400px]">
          {error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <AlertTriangle className="w-10 h-10 text-red-500 mb-4 opacity-80" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">حدث خطأ أثناء تحميل البيانات</h3>
              <p className="text-slate-500 max-w-md mb-4">{error.message}</p>
              <Button onClick={refresh} variant="outline">إعادة المحاولة</Button>
            </div>
          ) : isLoading && (!data || !data.data) ? (
            <div className="w-full">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 animate-pulse">
                  <div className="flex items-center gap-3 w-1/3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                  <div className="w-1/6"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div></div>
                  <div className="w-1/6"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div></div>
                  <div className="w-1/6"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></div>
                </div>
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <UserCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">لا يوجد مستخدمون</h3>
              <p className="text-slate-500 max-w-md">لا يوجد مستخدمون مطابقون لخيارات البحث الحالية.</p>
              {(filters.query || filters.status || filters.role) && (
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("query", "");
                    setFilter("status", "");
                    setFilter("role", "");
                  }} 
                  variant="ghost" 
                  className="mt-2 text-emerald-600"
                >
                  مسح الفلاتر
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">المستخدم</th>
                  <th className="px-6 py-4 font-medium">الدور</th>
                  <th className="px-6 py-4 font-medium">الحالة</th>
                  <th className="px-6 py-4 font-medium">تاريخ الإنشاء</th>
                  <th className="px-6 py-4 font-medium">آخر تسجيل دخول</th>
                  <th className="px-6 py-4 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.data.map((user) => (
                  <tr key={user.public_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold uppercase shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500 dir-ltr text-left" dir="ltr">{user.email}</p>
                          <p className="text-xs text-slate-500 dir-ltr text-left" dir="ltr">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map(role => (
                          <UserRoleBadge key={role} role={role} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500" dir="ltr">
                      {formatDateTime(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-slate-500" dir="ltr">
                      {user.last_login_at ? formatDateTime(user.last_login_at) : "لم يسجل دخول"}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/users/${user.public_id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600">
                          <MoreVertical className="w-4 h-4" />
                          <span className="sr-only">التفاصيل</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data && data.meta && (
          <Pagination
            currentPage={data.meta.current_page}
            totalPages={data.meta.last_page}
            onPageChange={(page) => setFilter("page", page)}
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  );
}
