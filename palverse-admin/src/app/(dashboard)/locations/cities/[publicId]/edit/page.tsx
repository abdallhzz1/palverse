"use client";

import { useCityDetails, useCityActions } from "@/hooks/use-cities";
import { UpdateCityRequest } from "@/types/taxonomy";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save } from "lucide-react";
import Link from "next/link";
import { LocalizedNameFields } from "@/components/taxonomy/localized-name-fields";
import React, { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const citySchema = z.object({
  name_ar: z.string().min(2, "الاسم بالعربية مطلوب ويجب أن يكون حرفين على الأقل").max(191, "الاسم طويل جداً"),
  name_en: z.string().max(191, "الاسم طويل جداً").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof citySchema>;

export default function EditCityPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  
  const { city, isLoading, error } = useCityDetails(resolvedParams.publicId);
  const { update, isSubmitting } = useCityActions(() => {
    router.push(`/locations/cities/${resolvedParams.publicId}`);
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name_ar: "",
      name_en: "",
    },
  });

  useEffect(() => {
    if (city) {
      reset({
        name_ar: city.name_ar,
        name_en: city.name_en || "",
      });
    }
  }, [city, reset]);

  const onSubmit = async (data: FormValues) => {
    const payload: UpdateCityRequest = {
      name_ar: data.name_ar,
      name_en: data.name_en || null,
    };
    await update(resolvedParams.publicId, payload);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">لم يتم العثور على المدينة</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button asChild variant="outline">
          <Link href="/locations?tab=cities">العودة للمدن</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/locations/cities/${resolvedParams.publicId}`}>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">تعديل المدينة</h2>
          <p className="text-muted-foreground">تحديث بيانات المدينة</p>
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

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" asChild disabled={isSubmitting}>
                <Link href={`/locations/cities/${resolvedParams.publicId}`}>إلغاء</Link>
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
