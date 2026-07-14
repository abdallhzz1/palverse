"use client";

import { useState } from "react";
import { useFaqsList, useFaqActions } from "@/hooks/use-faqs";
import { useDebounce } from "@/hooks/use-debounce";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreVertical, Edit, Trash } from "lucide-react";
import { FaqStatusBadge } from "./faq-status-badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";

export function FaqsList() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { deleteFaq, isMutating } = useFaqActions();

  const queryParams: any = {
    page,
    per_page: 15,
  };

  if (debouncedSearch) {
    queryParams.query = debouncedSearch;
  }
  
  if (isActiveFilter !== "all") {
    queryParams.is_active = isActiveFilter === "true";
  }

  const { data, isLoading, error, refresh } = useFaqsList(queryParams);

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await deleteFaq(deleteId);
    if (success) {
      setDeleteId(null);
      refresh();
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ابحث في الأسئلة الشائعة..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pr-9"
          />
        </div>
        <Select
          value={isActiveFilter}
          onValueChange={(val: string) => {
            setIsActiveFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="حالة السؤال" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="true">فعال</SelectItem>
            <SelectItem value="false">غير فعال</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>السؤال</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>الترتيب</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  جاري تحميل الأسئلة...
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
                  لا توجد أسئلة مطابقة لخيارات البحث
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((faq) => (
                <TableRow key={faq.public_id}>
                  <TableCell className="font-medium text-slate-900 max-w-sm truncate">
                    {faq.question_ar}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {faq.category || "-"}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {faq.sort_order}
                  </TableCell>
                  <TableCell>
                    <FaqStatusBadge isActive={faq.is_active} />
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {faq.created_at ? format(new Date(faq.created_at), "dd MMMM yyyy", { locale: ar }) : "-"}
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
                          <Link href={`/faqs/${faq.public_id}/edit`} className="cursor-pointer">
                            <Edit className="ml-2 h-4 w-4" />
                            تعديل
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => setDeleteId(faq.public_id)}>
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
        title="حذف السؤال الشائع"
        description="هل أنت متأكد من رغبتك في حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
        isLoading={isMutating}
      />
    </div>
  );
}
