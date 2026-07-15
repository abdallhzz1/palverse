"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuditLogsList } from "@/hooks/use-audit-logs";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Eye, Search, FilterX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { AuditActionBadge } from "./audit-action-badge";
import { AuditActorCard } from "./audit-actor-card";
import { AuditEntityBadge } from "./audit-entity-badge";

export function AuditLogsList() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const { data, isLoading, error } = useAuditLogsList({
    page,
    per_page: 15,
    query: debouncedQuery || undefined,
    action: actionFilter !== "all" ? actionFilter : undefined,
    sort: sortOrder,
  });

  const handleResetFilters = () => {
    setQuery("");
    setActionFilter("all");
    setSortOrder("newest");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">سجل العمليات</h2>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="ابحث في سجل العمليات (باسم المستخدم، رقم الطلب...)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="pr-9"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={actionFilter}
              onValueChange={(val: string) => {
                setActionFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب العملية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العمليات</SelectItem>
                <SelectItem value="user.created">إنشاء مستخدم</SelectItem>
                <SelectItem value="store.updated">تحديث محل</SelectItem>
                <SelectItem value="offer.created">إنشاء عرض</SelectItem>
                <SelectItem value="subscription.assigned">تعيين اشتراك</SelectItem>
                <SelectItem value="page.published">نشر صفحة</SelectItem>
                <SelectItem value="faq.created">إضافة سؤال شائع</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={sortOrder}
              onValueChange={(val: string) => {
                setSortOrder(val as "newest" | "oldest");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث أولاً</SelectItem>
                <SelectItem value="oldest">الأقدم أولاً</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(query || actionFilter !== "all" || sortOrder !== "newest") && (
            <Button variant="ghost" size="icon" onClick={handleResetFilters} title="مسح التصفية">
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>العملية</TableHead>
                <TableHead>المستخدم</TableHead>
                <TableHead>العنصر</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="text-left">التفاصيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    جاري تحميل سجل العمليات...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-red-500">
                    {error.message}
                  </TableCell>
                </TableRow>
              ) : !data?.data?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    {query || actionFilter !== "all" ? "لا توجد عمليات مطابقة لخيارات البحث" : "لا توجد عمليات مسجلة"}
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((log) => (
                  <TableRow key={log.public_id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <AuditActionBadge action={log.action} />
                    </TableCell>
                    <TableCell>
                      <AuditActorCard actor={log.actor} />
                    </TableCell>
                    <TableCell>
                      <AuditEntityBadge subject={log.subject} />
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                      {log.created_at ? format(new Date(log.created_at), "dd MMMM yyyy HH:mm", { locale: ar }) : "-"}
                    </TableCell>
                    <TableCell className="text-left">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/audit-logs/${log.public_id}`}>
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data?.meta && data.meta.last_page > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              إجمالي السجلات: {data.meta.total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                السابق
              </Button>
              <div className="flex items-center px-4 text-sm font-medium text-slate-700">
                {page} / {data.meta.last_page}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.meta.last_page, p + 1))}
                disabled={page === data.meta.last_page}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
