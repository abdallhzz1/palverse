"use client";

import { useCategoryActions } from "@/hooks/use-categories";
import { CreateCategoryRequest } from "@/types/taxonomy";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save } from "lucide-react";
import Link from "next/link";
import { LocalizedNameFields } from "@/components/taxonomy/localized-name-fields";

const categorySchema = z.object({
  name_ar: z.string().min(2, "الاسم بالعربية مطلوب ويجب أن يكون حرفين على الأقل").max(191, "الاسم طويل جداً"),
  name_en: z.string().max(191, "الاسم طويل جداً").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof categorySchema>;

export default function CreateCategoryPage() {
  const router = useRouter();
  const { create, isSubmitting } = useCategoryActions(() => {
    router.push("/categories");
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name_ar: "",
      name_en: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const payload: CreateCategoryRequest = {
      name_ar: data.name_ar,
      name_en: data.name_en || null,
    };
    await create(payload);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/categories">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">إضافة تصنيف جديد</h2>
          <p className="text-muted-foreground">أدخل بيانات التصنيف الجديد</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <LocalizedNameFields
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" asChild disabled={isSubmitting}>
              <Link href="/categories">إلغاء</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#0F3D2E] hover:bg-[#1E7D4E]">
              {isSubmitting ? "جاري الحفظ..." : "حفظ التصنيف"}
              <Save className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
