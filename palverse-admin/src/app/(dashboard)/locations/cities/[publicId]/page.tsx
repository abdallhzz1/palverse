"use client";

import { useCityDetails, useCityActions } from "@/hooks/use-cities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { format } from "date-fns";
import { Modal } from "@/components/ui/modal";

export default function CityDetailsPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = React.use(params);
  const { city, isLoading, error } = useCityDetails(resolvedParams.publicId);
  const { remove, isSubmitting } = useCityActions();
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
    const success = await remove(resolvedParams.publicId);
    if (success) {
      setDeleteOpen(false);
      router.push("/locations?tab=cities");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">لم يتم العثور على المدينة</h2>
        <p className="text-slate-600">{error.message}</p>
        <Button asChild variant="outline">
          <Link href="/locations?tab=cities">العودة للمدن</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/locations?tab=cities">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isLoading ? <Skeleton className="h-8 w-48" /> : city?.name_ar}
            </h2>
            <p className="text-slate-500">تفاصيل المدينة</p>
          </div>
        </div>
        {!isLoading && city && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/locations/cities/${city.public_id}/edit`}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </Link>
            </Button>
            <Button
              variant="danger"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="ml-2 h-4 w-4" />
              حذف
            </Button>
          </div>
        )}
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : city ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">الاسم بالعربية</p>
              <p className="text-lg font-semibold">{city.name_ar}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">الاسم بالإنجليزية</p>
              <p className="text-lg font-semibold">{city.name_en || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">المناطق المرتبطة</p>
              <p>
                <Link href={`/locations?tab=zones&city=${city.public_id}`} className="text-[#1E7D4E] hover:underline flex items-center gap-1 font-medium">
                  عرض المناطق
                </Link>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">تاريخ الإنشاء</p>
              <p className="text-base text-slate-700">
                {format(new Date(city.created_at), "PPP p")}
              </p>
            </div>
          </div>
        ) : null}
      </Card>

      <Modal
        isOpen={deleteOpen}
        onClose={() => !isSubmitting && setDeleteOpen(false)}
        title="حذف المدينة"
        description="هل أنت متأكد من رغبتك في حذف هذه المدينة؟ لا يمكن التراجع عن هذا الإجراء. ملاحظة: لا يمكن حذف المدينة لوجود مناطق مرتبطة بها."
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isSubmitting}>
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
