"use client";

import { useZoneActions } from "@/hooks/use-zones";
import { CreateZoneRequest } from "@/types/taxonomy";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { LocalizedNameFields } from "@/components/taxonomy/localized-name-fields";
import { CitySelect } from "@/components/taxonomy/city-select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const zoneSchema = z.object({
  city_public_id: z.string().min(1, "المدينة مطلوبة"),
  name_ar: z.string().min(2, "الاسم بالعربية مطلوب ويجب أن يكون حرفين على الأقل").max(191, "الاسم طويل جداً"),
  name_en: z.string().max(191, "الاسم طويل جداً").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof zoneSchema>;

export default function CreateZonePage() {
  const router = useRouter();
  const { isSubmitting } = useZoneActions(() => {
    router.push("/locations?tab=zones");
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      city_public_id: "",
      name_ar: "",
      name_en: "",
    },
  });

  const cityPublicId = watch("city_public_id");

  const onSubmit = async (data: FormValues) => {
    // CRITICAL API BLOCKER (Option 3):
    // The backend `StoreZoneRequest` expects a numeric `city_id`.
    // We only have `city_public_id` from `CitySelect`.
    // To strictly follow rules (Do not expose numeric IDs, Do not modify Laravel backend),
    // we block the submission here and show a clear error to the user until the backend is updated.
    
    toast.error("هذه الميزة غير متاحة حالياً. واجهة برمجة التطبيقات (API) تتطلب 'city_id' بدلاً من 'city_public_id'. يرجى تحديث الخادم لدعم المعرف العام أولاً.", {
      duration: 6000,
    });
    
    /* Uncomment below once backend is updated to accept city_public_id:
    const payload: CreateZoneRequest = {
      city_id: data.city_public_id as any, // or city_public_id if updated
      name_ar: data.name_ar,
      name_en: data.name_en || null,
    };
    await create(payload);
    */
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/locations?tab=zones">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">إضافة منطقة جديدة</h2>
          <p className="text-slate-500">أدخل بيانات المنطقة الجديدة واربطها بمدينة</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">تنبيه برمجي (API Blocker)</p>
          <p>
            لا يمكن إتمام حفظ المنطقة لأن الخادم (Backend) يتطلب إرسال المعرف الرقمي الداخلي <code>city_id</code> 
            للمدينة بدلاً من المعرف العام <code>city_public_id</code>. يرجى تحديث نقطة نهاية الحفظ في الخادم لتقبل المعرف العام قبل الاستخدام.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-2 max-w-md">
            <Label className="flex items-center gap-1">
              المدينة
              <span className="text-red-500">*</span>
            </Label>
            <CitySelect
              value={cityPublicId}
              onValueChange={(val) => setValue("city_public_id", val, { shouldValidate: true })}
              disabled={isSubmitting}
            />
            {errors.city_public_id && (
              <p className="text-sm text-red-500 mt-1">{errors.city_public_id.message}</p>
            )}
          </div>

          <LocalizedNameFields
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" asChild disabled={isSubmitting}>
              <Link href="/locations?tab=zones">إلغاء</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#0F3D2E] hover:bg-[#1E7D4E]">
              {isSubmitting ? "جاري الحفظ..." : "حفظ المنطقة"}
              <Save className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
