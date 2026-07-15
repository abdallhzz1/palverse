"use client";

import { useCategoryDetails, useCategoryActions } from "@/hooks/use-categories";
import { UpdateCategoryRequest } from "@/types/taxonomy";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save, Info } from "lucide-react";
import Link from "next/link";
import { LocalizedNameFields } from "@/components/taxonomy/localized-name-fields";
import React, { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const categorySchema = z.object({
  name_ar: z.string().min(2, "الاسم بالعربية مطلوب ويجب أن يكون حرفين على الأقل").max(191, "الاسم طويل جداً"),
  name_en: z.string().max(191, "الاسم طويل جداً").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof categorySchema>;

export default function EditCategoryPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  
  const { category, isLoading, error } = useCategoryDetails(resolvedParams.publicId);
  const { update, isSubmitting } = useCategoryActions(() => {
    router.push(`/categories/${resolvedParams.publicId}`);
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name_ar: "",
      name_en: "",
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name_ar: category.name_ar,
        name_en: category.name_en || "",
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: FormValues) => {
    const payload: UpdateCategoryRequest = {
      name_ar: data.name_ar,
      name_en: data.name_en || null,
    };
    await update(resolvedParams.publicId, payload);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">لم يتم العثور على التصنيف</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button asChild variant="outline">
          <Link href="/categories">العودة للتصنيفات</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/categories/${resolvedParams.publicId}`}>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">تعديل التصنيف</h2>
          <p className="text-muted-foreground">تحديث بيانات التصنيف</p>
        </div>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <LocalizedNameFields
              register={register}
              errors={errors}
              disabled={isSubmitting}
            />

            <div className="bg-blue-50 text-blue-800 p-4 rounded-md flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">ملاحظة هامة</p>
                <p>يبقى الرابط المختصر (Slug) ثابتاً بعد تعديل الاسم ولن يتغير.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" asChild disabled={isSubmitting}>
                <Link href={`/categories/${resolvedParams.publicId}`}>إلغاء</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#0F3D2E] hover:bg-[#1E7D4E]">
                {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                <Save className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
