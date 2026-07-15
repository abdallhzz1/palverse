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
  logo_url: z.string().url("رابط غير صالح").optional().or(z.literal("")).nullable(),
  logo_dark_url: z.string().url("رابط غير صالح").optional().or(z.literal("")).nullable(),
  favicon_url: z.string().url("رابط غير صالح").optional().or(z.literal("")).nullable(),
  primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "لون غير صالح").optional().or(z.literal("")).nullable(),
  secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "لون غير صالح").optional().or(z.literal("")).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function SettingsBrandingForm() {
  const { data, isLoading, error, refresh } = useSettingsGroup("branding");
  const { updateGroup, isUpdating, apiError } = useSettingsActions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo_url: "",
      logo_dark_url: "",
      favicon_url: "",
      primary_color: "",
      secondary_color: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        logo_url: data.logo_url?.value || "",
        logo_dark_url: data.logo_dark_url?.value || "",
        favicon_url: data.favicon_url?.value || "",
        primary_color: data.primary_color?.value || "",
        secondary_color: data.secondary_color?.value || "",
      });
    }
  }, [data, form]);

  const onSubmit = async (values: FormValues) => {
    // Nullify empty strings before sending
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
    );
    await updateGroup("branding", payload, () => {
      toast.success("تم حفظ الهوية البصرية بنجاح");
      refresh();
    });
  };

  if (isLoading) return <div className="py-12 text-center text-slate-500">جاري التحميل...</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error.message}</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">الهوية البصرية</h2>
          <p className="text-sm text-slate-500">إعدادات الشعار والألوان الخاصة بالمنصة</p>
        </div>

        {apiError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{apiError.message}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط الشعار الأساسي</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="logo_dark_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط الشعار الداكن</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="favicon_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط الأيقونة (Favicon)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="https://..." />
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
            name="primary_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اللون الأساسي (Primary Color)</FormLabel>
                <div className="flex gap-2">
                  <div 
                    className="w-10 h-10 rounded-md border border-slate-200 shrink-0" 
                    style={{ backgroundColor: field.value || "#0F3D2E" }}
                  />
                  <FormControl>
                    <Input {...field} value={field.value || ""} dir="ltr" className="text-left uppercase" placeholder="#0F3D2E" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="secondary_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اللون الثانوي (Secondary Color)</FormLabel>
                <div className="flex gap-2">
                  <div 
                    className="w-10 h-10 rounded-md border border-slate-200 shrink-0" 
                    style={{ backgroundColor: field.value || "#1E7D4E" }}
                  />
                  <FormControl>
                    <Input {...field} value={field.value || ""} dir="ltr" className="text-left uppercase" placeholder="#1E7D4E" />
                  </FormControl>
                </div>
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
