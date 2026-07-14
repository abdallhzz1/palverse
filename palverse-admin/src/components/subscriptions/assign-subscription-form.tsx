"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AssignStoreSubscriptionRequest } from "@/types/subscriptions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSubscriptionActions } from "@/hooks/use-subscriptions";
import { StoreSelector } from "@/components/shared/store-selector";
import { useSubscriptionPlansList } from "@/hooks/use-subscription-plans";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPlanDuration, formatPlanPrice } from "@/components/subscription-plans/plan-formatting";

// We allow dates to be optional, backend defaults them
const formSchema = z.object({
  store_public_id: z.string().min(1, "الرجاء اختيار المحل"),
  subscription_plan_public_id: z.string().min(1, "الرجاء اختيار الخطة"),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  notes: z.string().max(2000, "الملاحظات طويلة جداً").nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AssignSubscriptionForm() {
  const router = useRouter();
  const { assign, isSubmitting } = useSubscriptionActions(() => {
    router.push("/subscriptions");
  });

  const { data: plansData, isLoading: plansLoading } = useSubscriptionPlansList({ status: "active", per_page: 100 }, false);
  const plans = plansData?.data || [];

  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      store_public_id: "",
      subscription_plan_public_id: "",
      starts_at: "",
      ends_at: "",
      notes: "",
    },
  });

  const selectedPlanId = form.watch("subscription_plan_public_id");

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    try {
      const payload: AssignStoreSubscriptionRequest = {
        store_public_id: values.store_public_id,
        subscription_plan_public_id: values.subscription_plan_public_id,
        starts_at: values.starts_at || null,
        ends_at: values.ends_at || null,
        notes: values.notes || null,
      };

      await assign(payload);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized = err as any;
      if (normalized.errors) {
        Object.entries(normalized.errors).forEach(([key, messages]) => {
          form.setError(key as keyof FormValues, {
            type: "server",
            message: Array.isArray(messages) ? (messages[0] as string) : String(messages),
          });
        });
      }
      
      // Specifically handle the 409 conflict error (STORE_ALREADY_HAS_ACTIVE_SUBSCRIPTION)
      if (normalized.code === "STORE_ALREADY_HAS_ACTIVE_SUBSCRIPTION") {
         setApiError("يوجد اشتراك نشط لهذا المحل بالفعل. يرجى إلغاء الاشتراك الحالي أولاً أو انتظار انتهائه.");
      } else if (!normalized.errors) {
        setApiError(normalized.message || "حدث خطأ أثناء حفظ البيانات");
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg border border-slate-200">
      {apiError && (
        <div className="p-4 rounded-md bg-red-50 text-red-700 text-sm border border-red-100 flex items-start gap-2">
          <div className="mt-0.5">⚠️</div>
          <div>{apiError}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Store & Plan */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">تفاصيل الاشتراك</h3>
          
          <div className="space-y-2">
            <Label htmlFor="store_public_id">المحل <span className="text-red-500">*</span></Label>
            <StoreSelector 
              value={form.watch("store_public_id")} 
              onSelect={(val) => form.setValue("store_public_id", val, { shouldValidate: true })} 
              disabled={isSubmitting}
            />
            {form.formState.errors.store_public_id && (
              <p className="text-xs text-red-500">{form.formState.errors.store_public_id.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>خطة الاشتراك <span className="text-red-500">*</span></Label>
            
            {plansLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 p-4 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" /> جاري تحميل الخطط...
              </div>
            ) : plans.length === 0 ? (
              <div className="p-4 border rounded-md text-sm text-slate-500">
                لا توجد خطط نشطة متاحة
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {plans.map((plan) => (
                  <label 
                    key={plan.public_id}
                    className={cn(
                      "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedPlanId === plan.public_id 
                        ? "border-[#1E7D4E] bg-[#EAF3EC] ring-1 ring-[#1E7D4E]" 
                        : "hover:border-slate-300 bg-white"
                    )}
                  >
                    <input 
                      type="radio" 
                      className="sr-only"
                      value={plan.public_id}
                      {...form.register("subscription_plan_public_id")}
                    />
                    <div className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border mt-0.5",
                      selectedPlanId === plan.public_id ? "border-[#1E7D4E] bg-[#1E7D4E]" : "border-slate-300"
                    )}>
                      {selectedPlanId === plan.public_id && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{plan.name_ar}</span>
                        <span className="font-bold text-[#1E7D4E] font-sans" dir="ltr">{formatPlanPrice(plan.price, plan.currency)}</span>
                      </div>
                      <span className="text-sm text-slate-600">
                        مدة الاشتراك: {formatPlanDuration(plan.duration_days)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {form.formState.errors.subscription_plan_public_id && (
              <p className="text-xs text-red-500">{form.formState.errors.subscription_plan_public_id.message}</p>
            )}
          </div>
        </div>

        {/* Right Column: Dates & Notes */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">التواريخ والملاحظات</h3>

          <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm mb-4">
            <strong>ملاحظة:</strong> إذا تركت التواريخ فارغة، سيقوم النظام تلقائياً بتحديد تاريخ البدء من اليوم، وتاريخ الانتهاء بناءً على مدة الخطة.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts_at">تاريخ البدء (اختياري)</Label>
              <input
                type="date"
                id="starts_at"
                {...form.register("starts_at")}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
                disabled={isSubmitting}
              />
              {form.formState.errors.starts_at && (
                <p className="text-xs text-red-500">{form.formState.errors.starts_at.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">تاريخ الانتهاء (اختياري)</Label>
              <input
                type="date"
                id="ends_at"
                {...form.register("ends_at")}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
                disabled={isSubmitting}
              />
              {form.formState.errors.ends_at && (
                <p className="text-xs text-red-500">{form.formState.errors.ends_at.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (تظهر للإدارة فقط)</Label>
            <textarea
              id="notes"
              {...form.register("notes")}
              className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
              placeholder="أي ملاحظات حول هذا الاشتراك..."
              disabled={isSubmitting}
            />
            {form.formState.errors.notes && (
              <p className="text-xs text-red-500">{form.formState.errors.notes.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white min-w-[120px]"
        >
          {isSubmitting ? "جاري الحفظ..." : "تعيين الاشتراك"}
        </Button>
      </div>
    </form>
  );
}
