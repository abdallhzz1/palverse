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
  const { isSubmitting, create } = useZoneActions(() => {
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
    const payload: CreateZoneRequest = {
      city_public_id: data.city_public_id,
      name_ar: data.name_ar,
      name_en: data.name_en || null,
    } as any; // Cast as any since type still has city_id
    await create(payload);
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">إضافة منطقة جديدة</h2>
          <p className="text-muted-foreground">أدخل بيانات المنطقة الجديدة واربطها بمدينة</p>
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
