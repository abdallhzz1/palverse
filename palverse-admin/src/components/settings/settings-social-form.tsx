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
  facebook_url: z.string().url("رابط غير صالح").optional().or(z.literal("")).nullable(),
  instagram_url: z.string().url("رابط غير صالح").optional().or(z.literal("")).nullable(),
  tiktok_url: z.string().url("رابط غير صالح").optional().or(z.literal("")).nullable(),
  linkedin_url: z.string().url("رابط غير صالح").optional().or(z.literal("")).nullable(),
  youtube_url: z.string().url("رابط غير صالح").optional().or(z.literal("")).nullable(),
  x_url: z.string().url("رابط غير صالح").optional().or(z.literal("")).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function SettingsSocialForm() {
  const { data, isLoading, error, refresh } = useSettingsGroup("social");
  const { updateGroup, isUpdating, apiError } = useSettingsActions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facebook_url: "",
      instagram_url: "",
      tiktok_url: "",
      linkedin_url: "",
      youtube_url: "",
      x_url: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        facebook_url: data.facebook_url?.value || "",
        instagram_url: data.instagram_url?.value || "",
        tiktok_url: data.tiktok_url?.value || "",
        linkedin_url: data.linkedin_url?.value || "",
        youtube_url: data.youtube_url?.value || "",
        x_url: data.x_url?.value || "",
      });
    }
  }, [data, form]);

  const onSubmit = async (values: FormValues) => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
    );
    await updateGroup("social", payload, () => {
      toast.success("تم حفظ روابط التواصل الاجتماعي بنجاح");
      refresh();
    });
  };

  if (isLoading) return <div className="py-12 text-center text-slate-500">جاري التحميل...</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error.message}</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">التواصل الاجتماعي</h2>
          <p className="text-sm text-slate-500">روابط الحسابات الرسمية على منصات التواصل الاجتماعي</p>
        </div>

        {apiError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{apiError.message}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="facebook_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط فيسبوك (Facebook)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="https://facebook.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="instagram_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط إنستغرام (Instagram)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="https://instagram.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="x_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط إكس (X / Twitter)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="https://x.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="tiktok_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط تيك توك (TikTok)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="https://tiktok.com/@..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="youtube_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط يوتيوب (YouTube)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="https://youtube.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="linkedin_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط لينكد إن (LinkedIn)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} dir="ltr" className="text-left" placeholder="https://linkedin.com/..." />
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
