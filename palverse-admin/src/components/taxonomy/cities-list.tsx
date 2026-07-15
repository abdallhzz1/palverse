"use client";

import { useCitiesList, useCityActions } from "@/hooks/use-cities";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { Modal } from "@/components/ui/modal";

export function CitiesList() {
  const { data, isLoading, error, setFilter, refresh } = useCitiesList();
  const { remove, isSubmitting } = useCityActions(refresh);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await remove(deleteId);
    if (success) {
      setDeleteId(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-md bg-card">
        <h2 className="text-xl font-bold text-red-600 mb-2">حدث خطأ</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={refresh} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild className="bg-[#0F3D2E] hover:bg-[#1E7D4E]">
          <Link href="/locations/cities/new">
            <Plus className="ml-2 h-4 w-4" />
            إضافة مدينة
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المدينة</TableHead>
              <TableHead>الاسم الإنجليزي</TableHead>
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
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  لا توجد مدن حتى الآن
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((city) => (
                <TableRow key={city.public_id}>
                  <TableCell className="font-medium">{city.name_ar}</TableCell>
                  <TableCell>{city.name_en || "-"}</TableCell>
                  <TableCell>{format(new Date(city.created_at), "yyyy/MM/dd")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/locations/cities/${city.public_id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">عرض</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/locations/cities/${city.public_id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">تعديل</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(city.public_id)}
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

      <Modal
        isOpen={!!deleteId}
        onClose={() => !isSubmitting && setDeleteId(null)}
        title="حذف المدينة"
        description="هل أنت متأكد من رغبتك في حذف هذه المدينة؟ لا يمكن التراجع عن هذا الإجراء."
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
