"use client";

import { useSettingsGroup, useSettingsActions } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const formSchema = z.object({
  maintenance_message_ar: z.string().optional().nullable(),
  maintenance_message_en: z.string().optional().nullable(),
  registration_enabled: z.boolean(),
  merchant_registration_enabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function SettingsMaintenanceForm() {
  const { data, isLoading, error, refresh } = useSettingsGroup("maintenance");
  const { updateGroup, isUpdating, apiError } = useSettingsActions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maintenance_message_ar: "",
      maintenance_message_en: "",
      registration_enabled: true,
      merchant_registration_enabled: true,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        maintenance_message_ar: data.maintenance_message_ar?.value || "",
        maintenance_message_en: data.maintenance_message_en?.value || "",
        registration_enabled: data.registration_enabled?.value === "true" || data.registration_enabled?.value === true || data.registration_enabled?.value === "1",
        merchant_registration_enabled: data.merchant_registration_enabled?.value === "true" || data.merchant_registration_enabled?.value === true || data.merchant_registration_enabled?.value === "1",
      });
    }
  }, [data, form]);

  const onSubmit = async (values: FormValues) => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
    );
    await updateGroup("maintenance", payload, () => {
      toast.success("تم حفظ إعدادات الصيانة بنجاح");
      refresh();
    });
  };

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error.message}</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">الصيانة والتسجيل</h2>
          <p className="text-sm text-muted-foreground">التحكم بفتح وإغلاق التسجيل، ورسائل الصيانة</p>
        </div>

        {apiError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{apiError.message}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted p-4 rounded-xl border border-border">
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="registration_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-card p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">تسجيل المستخدمين</FormLabel>
                  <p className="text-sm text-muted-foreground">السماح للمستخدمين الجدد بالتسجيل كزبائن</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="merchant_registration_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-card p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">تسجيل التجار</FormLabel>
                  <p className="text-sm text-muted-foreground">السماح للتجار الجدد بالتسجيل وطلب فتح متجر</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="maintenance_message_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رسالة الصيانة (العربية)</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} rows={3} placeholder="نعتذر، الموقع تحت الصيانة حالياً..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="maintenance_message_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رسالة الصيانة (الإنجليزية)</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} rows={3} dir="ltr" className="text-left" placeholder="We are currently undergoing maintenance..." />
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
