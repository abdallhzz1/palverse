"use client";

import { useSettingsGroup, useSettingsActions } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const formSchema = z.object({
  platform_name_ar: z.string().min(1, "مطلوب"),
  platform_name_en: z.string().optional().nullable(),
  platform_description_ar: z.string().optional().nullable(),
  platform_description_en: z.string().optional().nullable(),
  default_currency: z.string().min(1, "مطلوب"),
  default_language: z.string().min(1, "مطلوب"),
  timezone: z.string().min(1, "مطلوب"),
});

type FormValues = z.infer<typeof formSchema>;

export function SettingsGeneralForm() {
  const { data, isLoading, error, refresh } = useSettingsGroup("general");
  const { updateGroup, isUpdating, apiError } = useSettingsActions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform_name_ar: "",
      platform_name_en: "",
      platform_description_ar: "",
      platform_description_en: "",
      default_currency: "ILS",
      default_language: "ar",
      timezone: "Asia/Gaza",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        platform_name_ar: data.platform_name_ar?.value || "",
        platform_name_en: data.platform_name_en?.value || "",
        platform_description_ar: data.platform_description_ar?.value || "",
        platform_description_en: data.platform_description_en?.value || "",
        default_currency: data.default_currency?.value || "ILS",
        default_language: data.default_language?.value || "ar",
        timezone: data.timezone?.value || "Asia/Gaza",
      });
    }
  }, [data, form]);

  const onSubmit = async (values: FormValues) => {
    const success = await updateGroup("general", values, () => {
      toast.success("تم حفظ الإعدادات بنجاح");
      refresh();
    });
  };

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">جاري تحميل الإعدادات...</div>;
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600 mb-4">{error.message}</p>
        <Button onClick={refresh} variant="outline">إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">الإعدادات العامة</h2>
          <p className="text-sm text-muted-foreground">الاسم، الوصف، والعملة الافتراضية للمنصة</p>
        </div>

        {apiError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {apiError.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="platform_name_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المنصة (العربية) *</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="platform_name_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المنصة (الإنجليزية)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" />
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
            name="platform_description_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الوصف (العربية)</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="platform_description_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الوصف (الإنجليزية)</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} rows={3} dir="ltr" className="text-left" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="default_currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العملة الافتراضية</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger dir="ltr" className="text-left">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ILS">ILS - شيكل</SelectItem>
                    <SelectItem value="USD">USD - دولار</SelectItem>
                    <SelectItem value="JOD">JOD - دينار</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="default_language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اللغة الافتراضية</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المنطقة الزمنية</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button type="submit" disabled={isUpdating || !form.formState.isDirty} className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90 min-w-[120px]">
            {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
