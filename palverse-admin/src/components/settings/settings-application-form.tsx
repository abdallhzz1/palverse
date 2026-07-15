"use client";

import { useSettingsGroup, useSettingsActions } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const formSchema = z.object({
  android_app_url: z.string().url("رابط غير صالح").optional().or(z.literal("")).nullable(),
  ios_app_url: z.string().url("رابط غير صالح").optional().or(z.literal("")).nullable(),
  minimum_android_version: z.string().optional().or(z.literal("")).nullable(),
  minimum_ios_version: z.string().optional().or(z.literal("")).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function SettingsApplicationForm() {
  const { data, isLoading, error, refresh } = useSettingsGroup("application");
  const { updateGroup, isUpdating, apiError } = useSettingsActions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      android_app_url: "",
      ios_app_url: "",
      minimum_android_version: "",
      minimum_ios_version: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        android_app_url: data.android_app_url?.value || "",
        ios_app_url: data.ios_app_url?.value || "",
        minimum_android_version: data.minimum_android_version?.value || "",
        minimum_ios_version: data.minimum_ios_version?.value || "",
      });
    }
  }, [data, form]);

  const onSubmit = async (values: FormValues) => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
    );
    await updateGroup("application", payload, () => {
      toast.success("تم حفظ إعدادات التطبيقات بنجاح");
      refresh();
    });
  };

  if (isLoading) return <div className="py-12 text-center text-slate-500">جاري التحميل...</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error.message}</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">تطبيقات الجوال</h2>
          <p className="text-sm text-slate-500">روابط متاجر التطبيقات والحد الأدنى للنسخ المدعومة</p>
        </div>

        {apiError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{apiError.message}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="android_app_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط تطبيق أندرويد (Google Play)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="https://play.google.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="minimum_android_version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحد الأدنى لنسخة أندرويد</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="1.0.0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="ios_app_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط تطبيق iOS (App Store)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="https://apps.apple.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="minimum_ios_version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحد الأدنى لنسخة iOS</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="1.0.0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button type="submit" disabled={isUpdating || !form.formState.isDirty} className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90 min-w-[120px]">
            {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
