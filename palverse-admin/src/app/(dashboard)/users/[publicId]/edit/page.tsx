"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserDetail, useUserActions } from "@/hooks/use-user-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Save, User as UserIcon } from "lucide-react";

const updateUserSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
  email: z.string().email("صيغة البريد الإلكتروني غير صحيحة"),
  phone: z.string().min(9, "رقم الهاتف غير صحيح").max(20),
  preferred_locale: z.enum(["ar", "en"]),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export default function EditUserPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isLoading } = useUserDetail(resolvedParams.publicId);
  const { update, isSubmitting } = useUserActions(resolvedParams.publicId, () => {
    router.push(`/users/${resolvedParams.publicId}`);
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferred_locale: "ar",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferred_locale: user.preferred_locale,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserFormValues) => {
    await update(data);
  };

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="h-96 w-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Link href={`/users/${user.public_id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">تعديل بيانات المستخدم</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تحديث البيانات الأساسية للمستخدم</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">البيانات الأساسية</h3>
            <p className="text-xs text-slate-500">{user.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم المكتمل</Label>
              <Input
                id="name"
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
                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1F2522] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
              {errors.preferred_locale && <p className="text-sm text-red-500">{errors.preferred_locale.message}</p>}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Link href={`/users/${user.public_id}`}>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                إلغاء
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-[#1E7D4E] hover:bg-[#1E7D4E]/90 text-white gap-2">
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
