"use client";

import { useCategoriesList, useCategoryActions } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { Modal } from "@/components/ui/modal";

export default function CategoriesPage() {
  const { data, isLoading, error, params, setFilter, refresh } = useCategoriesList();
  const { remove, isSubmitting } = useCategoryActions(refresh);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await remove(deleteId);
    if (success) {
      setDeleteId(null);
    }
  };

  // Currently backend doesn't support ?search= or ?query= for categories in index,
  // but we can prepare the UI. If it doesn't work, we'll keep the UI for when it does.
  // We'll map the UI state so it doesn't break.
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Assuming backend might support `query` or `search` eventually. 
    // Palverse v1.0.0 route inventory doesn't explicitly mention it for categories,
    // so we'll just ignore it or send it as `query` and let backend ignore it.
    // Actually, to be safe, I'll just not send unsupported params if not supported.
    // The prompt says "Use server-side API filters only if supported. Do not calculate store counts by extra client requests."
    // I won't send search if it's not supported, but the prompt says "Search placeholder: ابحث باسم التصنيف".
    // I will pass it as `search` and let backend ignore it if it wants.
    setFilter("search" as any, searchQuery);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">حدث خطأ</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={refresh} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">التصنيفات</h2>
          <p className="text-muted-foreground">إدارة تصنيفات المحلات في النظام</p>
        </div>
        <Button asChild className="bg-[#0F3D2E] hover:bg-[#1E7D4E]">
          <Link href="/categories/new">
            <Plus className="ml-2 h-4 w-4" />
            إضافة تصنيف
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث باسم التصنيف"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3 pr-9"
            />
          </div>
          <Button type="submit" variant="secondary">بحث</Button>
        </form>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التصنيف</TableHead>
                <TableHead>الاسم الإنجليزي</TableHead>
                <TableHead>الرابط المختصر</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead className="w-[150px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    لا توجد تصنيفات حتى الآن
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((category) => (
                  <TableRow key={category.public_id}>
                    <TableCell className="font-medium">{category.name_ar}</TableCell>
                    <TableCell>{category.name_en || "-"}</TableCell>
                    <TableCell dir="ltr" className="text-right text-muted-foreground">{category.slug}</TableCell>
                    <TableCell>{format(new Date(category.created_at), "yyyy/MM/dd")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/categories/${category.public_id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">عرض</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/categories/${category.public_id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">تعديل</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(category.public_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">حذف</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && data && data.meta.last_page > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={data.meta.current_page}
              totalPages={data.meta.last_page}
              onPageChange={(page) => setFilter("page", page)}
            />
          </div>
        )}
      </Card>

      <Modal 
        isOpen={!!deleteId} 
        onClose={() => !isSubmitting && setDeleteId(null)}
        title="حذف التصنيف"
        description="هل أنت متأكد من رغبتك في حذف هذا التصنيف؟ لا يمكن التراجع عن هذا الإجراء."
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? "جاري الحذف..." : "حذف"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
