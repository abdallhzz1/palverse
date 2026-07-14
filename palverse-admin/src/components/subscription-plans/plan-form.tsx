"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubscriptionPlan, StoreSubscriptionPlanRequest } from "@/types/subscription-plans";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSubscriptionPlanActions } from "@/hooks/use-subscription-plans";

const formSchema = z.object({
  name_ar: z.string().min(1, "الاسم بالعربية مطلوب").max(180, "الاسم يجب أن لا يتجاوز 180 حرفاً"),
  name_en: z.string().max(180, "الاسم يجب أن لا يتجاوز 180 حرفاً").nullable().optional(),
  code: z.string().min(1, "الرمز مطلوب").max(100, "الرمز يجب أن لا يتجاوز 100 حرف"),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  price: z.coerce.number().min(0, "السعر لا يمكن أن يكون سالباً"),
  currency: z.string().max(3, "رمز العملة يجب أن يكون 3 أحرف").nullable().optional(),
  duration_days: z.coerce.number().min(1, "المدة يجب أن تكون يوماً واحداً على الأقل"),
  max_offers: z.union([z.coerce.number().min(0, "عدد العروض لا يمكن أن يكون سالباً"), z.nan(), z.null()]).optional().transform(v => Number.isNaN(v) ? null : v),
  max_gallery_images: z.union([z.coerce.number().min(0, "عدد الصور لا يمكن أن يكون سالباً"), z.nan(), z.null()]).optional().transform(v => Number.isNaN(v) ? null : v),
  is_active: z.boolean().default(true),
  sort_order: z.union([z.coerce.number().min(0), z.nan(), z.null()]).optional().transform(v => Number.isNaN(v) ? null : v),
});

type FormValues = z.infer<typeof formSchema>;

interface PlanFormProps {
  initialData?: SubscriptionPlan;
}

export function PlanForm({ initialData }: PlanFormProps) {
  const router = useRouter();
  const { create, update, isSubmitting } = useSubscriptionPlanActions(() => {
    router.push("/subscription-plans");
  });

  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name_ar: initialData?.name_ar || "",
      name_en: initialData?.name_en || "",
      code: initialData?.code || "",
      description_ar: initialData?.description_ar || "",
      description_en: initialData?.description_en || "",
      price: initialData ? Number(initialData.price) : 0,
      currency: initialData?.currency || "ILS",
      duration_days: initialData?.duration_days || 30,
      max_offers: initialData?.max_offers ?? null,
      max_gallery_images: initialData?.max_gallery_images ?? null,
      is_active: initialData ? initialData.is_active : true,
      sort_order: initialData?.sort_order ?? 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    try {
      // Clean up nulls
      const payload: StoreSubscriptionPlanRequest = {
        name_ar: values.name_ar,
        name_en: values.name_en || null,
        code: values.code,
        description_ar: values.description_ar || null,
        description_en: values.description_en || null,
        price: values.price!,
        currency: values.currency || null,
        duration_days: values.duration_days!,
        max_offers: values.max_offers,
        max_gallery_images: values.max_gallery_images,
        is_active: values.is_active,
        sort_order: values.sort_order,
      };

      if (initialData) {
        await update(initialData.public_id, payload);
      } else {
        await create(payload);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.errors) {
        Object.entries(err.errors).forEach(([key, messages]) => {
          form.setError(key as keyof FormValues, {
            type: "server",
            message: Array.isArray(messages) ? messages[0] : String(messages),
          });
        });
      } else {
        setApiError(err.message || "حدث خطأ غير متوقع");
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg border border-slate-200">
      {apiError && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 text-sm">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">المعلومات الأساسية</h3>
          
          <div className="space-y-2">
            <Label htmlFor="name_ar">الاسم (بالعربية) <span className="text-red-500">*</span></Label>
            <Input id="name_ar" {...form.register("name_ar")} placeholder="مثال: الخطة الماسية" />
            {form.formState.errors.name_ar && (
              <p className="text-xs text-red-500">{form.formState.errors.name_ar.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_en">الاسم (بالإنجليزية)</Label>
            <Input id="name_en" {...form.register("name_en")} dir="ltr" placeholder="e.g. Diamond Plan" />
            {form.formState.errors.name_en && (
              <p className="text-xs text-red-500">{form.formState.errors.name_en.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">رمز الخطة (Code) <span className="text-red-500">*</span></Label>
            <Input id="code" {...form.register("code")} dir="ltr" placeholder="DIAMOND_PLAN" />
            {form.formState.errors.code && (
              <p className="text-xs text-red-500">{form.formState.errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_ar">الوصف (بالعربية)</Label>
            <textarea
              id="description_ar"
              {...form.register("description_ar")}
              className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              placeholder="وصف مميزات الخطة للمستخدمين..."
            />
            {form.formState.errors.description_ar && (
              <p className="text-xs text-red-500">{form.formState.errors.description_ar.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_en">الوصف (بالإنجليزية)</Label>
            <textarea
              id="description_en"
              {...form.register("description_en")}
              dir="ltr"
              className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 font-sans"
              placeholder="English description..."
            />
            {form.formState.errors.description_en && (
              <p className="text-xs text-red-500">{form.formState.errors.description_en.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">التسعير والمدة</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">السعر <span className="text-red-500">*</span></Label>
              <Input id="price" type="number" step="0.01" {...form.register("price")} dir="ltr" />
              {form.formState.errors.price && (
                <p className="text-xs text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">العملة</Label>
              <Input id="currency" {...form.register("currency")} dir="ltr" placeholder="ILS" />
              {form.formState.errors.currency && (
                <p className="text-xs text-red-500">{form.formState.errors.currency.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration_days">المدة (بالأيام) <span className="text-red-500">*</span></Label>
            <Input id="duration_days" type="number" {...form.register("duration_days")} dir="ltr" />
            <p className="text-xs text-slate-500">أمثلة: 30 لشهر، 365 لسنة</p>
            {form.formState.errors.duration_days && (
              <p className="text-xs text-red-500">{form.formState.errors.duration_days.message}</p>
            )}
          </div>

          <h3 className="text-lg font-semibold border-b pb-2 mt-8">القيود (الميزات)</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_offers">أقصى عدد للعروض</Label>
              <Input id="max_offers" type="number" {...form.register("max_offers")} dir="ltr" placeholder="لا محدود" />
              <p className="text-xs text-slate-500">اتركه فارغاً لجعله لا محدود</p>
              {form.formState.errors.max_offers && (
                <p className="text-xs text-red-500">{form.formState.errors.max_offers.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_gallery_images">أقصى عدد للصور في المعرض</Label>
              <Input id="max_gallery_images" type="number" {...form.register("max_gallery_images")} dir="ltr" placeholder="لا محدود" />
              <p className="text-xs text-slate-500">اتركه فارغاً لجعله لا محدود</p>
              {form.formState.errors.max_gallery_images && (
                <p className="text-xs text-red-500">{form.formState.errors.max_gallery_images.message}</p>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold border-b pb-2 mt-8">إعدادات إضافية</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort_order">ترتيب الظهور</Label>
              <Input id="sort_order" type="number" {...form.register("sort_order")} dir="ltr" />
            </div>
            
            <div className="space-y-2 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-md">
                <input type="checkbox" {...form.register("is_active")} className="h-4 w-4 rounded border-slate-300 text-[#1E7D4E] focus:ring-[#1E7D4E]" />
                <span className="text-sm font-medium">الخطة نشطة</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white min-w-[120px]"
        >
          {isSubmitting ? "جاري الحفظ..." : initialData ? "تحديث الخطة" : "إنشاء الخطة"}
        </Button>
      </div>
    </form>
  );
}
