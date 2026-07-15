"use client";

import { useState } from "react";
import { usePagesList, usePageActions } from "@/hooks/use-pages";
import { useDebounce } from "@/hooks/use-debounce";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreVertical, Edit, Trash, Eye, EyeOff } from "lucide-react";
import { PageStatusBadge } from "./page-status-badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";

export function PagesList() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isPublishedFilter, setIsPublishedFilter] = useState<string>("all");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [unpublishId, setUnpublishId] = useState<string | null>(null);

  const { deletePage, publishPage, unpublishPage, isMutating } = usePageActions();

  const queryParams: Record<string, string | number | boolean> = {
    page,
    per_page: 15,
  };

  if (debouncedSearch) {
    queryParams.query = debouncedSearch;
  }
  
  if (isPublishedFilter !== "all") {
    queryParams.is_published = isPublishedFilter === "true";
  }

  const { data, isLoading, error, refresh } = usePagesList(queryParams);

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await deletePage(deleteId);
    if (success) {
      setDeleteId(null);
      refresh();
    }
  };

  const handlePublish = async () => {
    if (!publishId) return;
    const success = await publishPage(publishId);
    if (success) {
      setPublishId(null);
      refresh();
    }
  };

  const handleUnpublish = async () => {
    if (!unpublishId) return;
    const success = await unpublishPage(unpublishId);
    if (success) {
      setUnpublishId(null);
      refresh();
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ابحث عن صفحة..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pr-9"
          />
        </div>
        <Select
          value={isPublishedFilter}
          onValueChange={(val: string) => {
            setIsPublishedFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="حالة النشر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="true">منشورة</SelectItem>
            <SelectItem value="false">غير منشورة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>الرابط (Slug)</TableHead>
              <TableHead>الترتيب</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>آخر تحديث</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  جاري تحميل الصفحات...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-red-500">
                  {error.message}
                </TableCell>
              </TableRow>
            ) : !data?.data?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  لا توجد صفحات مطابقة لخيارات البحث
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((pageData) => (
                <TableRow key={pageData.public_id}>
                  <TableCell className="font-medium text-slate-900">
                    {pageData.title_ar}
                  </TableCell>
                  <TableCell dir="ltr" className="text-right text-slate-600 text-sm font-mono">
                    /{pageData.slug}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {pageData.sort_order}
                  </TableCell>
                  <TableCell>
                    <PageStatusBadge isPublished={pageData.is_published} />
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {pageData.updated_at ? format(new Date(pageData.updated_at), "dd MMMM yyyy", { locale: ar }) : "-"}
                  </TableCell>
                  <TableCell className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">فتح القائمة</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/pages/${pageData.public_id}/edit`} className="cursor-pointer">
                            <Edit className="ml-2 h-4 w-4" />
                            تعديل
                          </Link>
                        </DropdownMenuItem>
                        
                        {pageData.is_published ? (
                          <DropdownMenuItem className="cursor-pointer text-amber-600" onClick={() => setUnpublishId(pageData.public_id)}>
                            <EyeOff className="ml-2 h-4 w-4" />
                            إلغاء النشر
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="cursor-pointer text-emerald-600" onClick={() => setPublishId(pageData.public_id)}>
                            <Eye className="ml-2 h-4 w-4" />
                            نشر
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => setDeleteId(pageData.public_id)}>
                          <Trash className="ml-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.meta && data.meta.last_page > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.meta.last_page}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="حذف الصفحة"
        description="هل أنت متأكد من رغبتك في حذف هذه الصفحة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
        isLoading={isMutating}
      />

      <ConfirmDialog
        isOpen={!!publishId}
        onClose={() => setPublishId(null)}
        onConfirm={handlePublish}
        title="نشر الصفحة"
        description="هل تريد نشر هذه الصفحة للعامة؟"
        confirmText="نشر"
        cancelText="إلغاء"
        isLoading={isMutating}
      />

      <ConfirmDialog
        isOpen={!!unpublishId}
        onClose={() => setUnpublishId(null)}
        onConfirm={handleUnpublish}
        title="إلغاء نشر الصفحة"
        description="هل تريد إلغاء نشر هذه الصفحة؟ لن تظهر للعامة بعد الآن."
        confirmText="إلغاء النشر"
        cancelText="إلغاء"
        isLoading={isMutating}
      />
    </div>
  );
}
