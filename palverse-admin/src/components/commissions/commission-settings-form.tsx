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
  representative_commission_amount: z.string().min(1, "الرجاء إدخال قيمة العمولة"),
});

type FormValues = z.infer<typeof formSchema>;

export function CommissionSettingsForm() {
  const { data, isLoading, error, refresh } = useSettingsGroup("financial");
  const { updateGroup, isUpdating, apiError } = useSettingsActions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      representative_commission_amount: "100.00",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        representative_commission_amount: data.representative_commission_amount?.value || "100.00",
      });
    }
  }, [data, form]);

  const onSubmit = async (values: FormValues) => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
    );
    await updateGroup("financial", payload, () => {
      toast.success("تم حفظ إعدادات العمولة بنجاح");
      refresh();
    });
  };

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">جاري التحميل...</div>;
  if (error) return <div className="py-8 text-center text-red-600">{error.message}</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">إعدادات العمولة</h3>
          <p className="text-sm text-muted-foreground">تحديد قيمة عمولة المندوب عند اعتماد كل متجر</p>
        </div>

        {apiError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{apiError.message}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="representative_commission_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>قيمة عمولة المندوب عن كل متجر معتمد</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" dir="ltr" />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  المبلغ الذي سيتم تسجيله كعمولة للمندوب عند اعتماد متجر قام بتسجيله.
                </p>
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
