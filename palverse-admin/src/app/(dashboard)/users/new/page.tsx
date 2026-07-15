"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usersService } from "@/services/users.service";
import { normalizeApiError } from "@/lib/api/error";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Eye, EyeOff, Store, Save } from "lucide-react";

const createMerchantSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
  email: z.string().email("صيغة البريد الإلكتروني غير صحيحة"),
  phone: z.string().min(9, "رقم الهاتف غير صحيح").max(20),
  preferred_locale: z.enum(["ar", "en"]),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  password_confirmation: z.string().min(8, "تأكيد كلمة المرور غير صحيح"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "كلمات المرور غير متطابقة",
  path: ["password_confirmation"],
});

type CreateMerchantFormValues = z.infer<typeof createMerchantSchema>;

export default function CreateMerchantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMerchantFormValues>({
    resolver: zodResolver(createMerchantSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferred_locale: "ar",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: CreateMerchantFormValues) => {
    setIsSubmitting(true);
    try {
      const user = await usersService.createMerchant(data);
      toast.success("تم إنشاء التاجر بنجاح");
      router.push(`/users/${user.public_id}`);
    } catch (err) {
      const error = normalizeApiError(err);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">إضافة تاجر جديد</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">إنشاء حساب جديد بصلاحيات تاجر</p>
        </div>
      </div>

      <div className="bg-card dark:bg-[#1F2522] rounded-xl border border-border dark:border-emerald-900/30 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border dark:border-slate-800">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground dark:text-white">البيانات الأساسية</h3>
            <p className="text-xs text-muted-foreground">أدخل بيانات التاجر وحساب الدخول</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">اسم التاجر</Label>
              <Input
                id="name"
                placeholder="أحمد محمد"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                placeholder="merchant@example.com"
                {...register("email")}
                className={errors.email ? "border-red-500 text-left" : "text-left"}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-sm text-red-500 text-right">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                dir="ltr"
                placeholder="+970xxxxxxxxx"
                {...register("phone")}
                className={errors.phone ? "border-red-500 text-left" : "text-left"}
                disabled={isSubmitting}
              />
              {errors.phone && <p className="text-sm text-red-500 text-right">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_locale">اللغة المفضلة</Label>
              <select
                id="preferred_locale"
                {...register("preferred_locale")}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-border dark:border-slate-800 bg-card dark:bg-[#1F2522] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
              {errors.preferred_locale && <p className="text-sm text-red-500">{errors.preferred_locale.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  {...register("password")}
                  className={errors.password ? "border-red-500 text-left pr-10" : "text-left pr-10"}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-emerald-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 text-right">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  {...register("password_confirmation")}
                  className={errors.password_confirmation ? "border-red-500 text-left pr-10" : "text-left pr-10"}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-emerald-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password_confirmation && <p className="text-sm text-red-500 text-right">{errors.password_confirmation.message}</p>}
            </div>
          </div>

          <div className="pt-6 border-t border-border dark:border-slate-800 flex justify-end gap-3">
            <Link href="/users">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                إلغاء
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-[#1E7D4E] hover:bg-[#1E7D4E]/90 text-white gap-2">
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "جاري الحفظ..." : "حفظ وإنشاء التاجر"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
