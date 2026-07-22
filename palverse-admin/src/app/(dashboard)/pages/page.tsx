"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search, AlertCircle, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { usePagesList, usePageActions } from "@/hooks/use-pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDateTime } from "@/lib/utils/formatters";
import { StaticPage } from "@/types/pages";

export default function PagesPage() {
  const [query, setQuery] = useState("");
  const [published, setPublished] = useState<string>("");
  const [page, setPage] = useState(1);

  const params = {
    query: query || undefined,
    is_published: published === "" ? undefined : published,
    page,
    per_page: 15,
  };

  const { data, isLoading, error, refresh } = usePagesList(params);
  const { setPublished: togglePublish, deletePage, isMutating } = usePageActions();
  const [pendingDelete, setPendingDelete] = useState<StaticPage | null>(null);

  const handleTogglePublish = async (p: StaticPage) => {
    await togglePublish(p.public_id, !p.is_published, () => refresh());
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await deletePage(pendingDelete.public_id, () => {
      setPendingDelete(null);
      refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#1E7D4E]" />
            الصفحات التعريفية
          </h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
            إدارة صفحات المحتوى الثابتة على الموقع (من نحن، الشروط، سياسة الخصوصية...).
          </p>
        </div>
        <Button asChild className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white gap-2">
          <Link href="/pages/new">
            <Plus className="w-4 h-4" />
            إضافة صفحة
          </Link>
        </Button>
      </div>

      <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-border dark:border-slate-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث بالعنوان أو المعرّف..."
              className="pr-9 w-full"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="h-10 px-3 py-2 rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={published}
            onChange={(e) => {
              setPublished(e.target.value);
              setPage(1);
            }}
          >
            <option value="">جميع الحالات</option>
            <option value="true">منشور</option>
            <option value="false">غير منشور</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-muted-foreground bg-muted dark:bg-slate-800/50 uppercase border-b border-border dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">العنوان</th>
                <th className="px-6 py-4 font-medium">المعرّف</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">الترتيب</th>
                <th className="px-6 py-4 font-medium">تاريخ النشر</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
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
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد صفحات</p>
                  </td>
                </tr>
              ) : (
                data?.data.map((p) => (
                  <tr key={p.public_id} className="hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground dark:text-white">{p.title_ar}</div>
                      {p.title_en && <div className="text-xs text-muted-foreground" dir="ltr">{p.title_en}</div>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground" dir="ltr">
                      <span className="font-mono text-xs">{p.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      {p.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <Eye className="w-3 h-3" /> منشور
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground dark:bg-slate-800">
                          <EyeOff className="w-3 h-3" /> مسودة
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground" dir="ltr">{p.sort_order ?? "-"}</td>
                    <td className="px-6 py-4 text-muted-foreground" dir="ltr">{p.published_at ? formatDateTime(p.published_at) : "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild title="تعديل">
                          <Link href={`/pages/${p.public_id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={p.is_published ? "إلغاء النشر" : "نشر"}
                          disabled={isMutating}
                          onClick={() => handleTogglePublish(p)}
                        >
                          {p.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="حذف"
                          onClick={() => setPendingDelete(p)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="حذف الصفحة"
        description={`هل أنت متأكد من حذف صفحة "${pendingDelete?.title_ar}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        variant="danger"
        confirmText="حذف"
        isLoading={isMutating}
      />
    </div>
  );
}
