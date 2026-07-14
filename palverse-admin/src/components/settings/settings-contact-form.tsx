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
  support_email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")).nullable(),
  support_phone: z.string().optional().or(z.literal("")).nullable(),
  support_whatsapp: z.string().optional().or(z.literal("")).nullable(),
  address_ar: z.string().optional().or(z.literal("")).nullable(),
  address_en: z.string().optional().or(z.literal("")).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function SettingsContactForm() {
  const { data, isLoading, error, refresh } = useSettingsGroup("contact");
  const { updateGroup, isUpdating, apiError } = useSettingsActions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      support_email: "",
      support_phone: "",
      support_whatsapp: "",
      address_ar: "",
      address_en: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        support_email: data.support_email?.value || "",
        support_phone: data.support_phone?.value || "",
        support_whatsapp: data.support_whatsapp?.value || "",
        address_ar: data.address_ar?.value || "",
        address_en: data.address_en?.value || "",
      });
    }
  }, [data, form]);

  const onSubmit = async (values: FormValues) => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
    );
    await updateGroup("contact", payload, () => {
      toast.success("تم حفظ معلومات التواصل بنجاح");
      refresh();
    });
  };

  if (isLoading) return <div className="py-12 text-center text-slate-500">جاري التحميل...</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error.message}</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">معلومات التواصل</h2>
          <p className="text-sm text-slate-500">أرقام الهواتف والبريد الإلكتروني المخصص للدعم الفني</p>
        </div>

        {apiError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{apiError.message}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control as any}
            name="support_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="support_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="support_whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الواتساب</FormLabel>
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
            control={form.control as any}
            name="address_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العنوان (العربية)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="address_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العنوان (الإنجليزية)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" />
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
