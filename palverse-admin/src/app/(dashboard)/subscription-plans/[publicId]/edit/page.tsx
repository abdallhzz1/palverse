"use client";

import React from "react";
import { useSubscriptionPlanDetails } from "@/hooks/use-subscription-plans";
import { PlanForm } from "@/components/subscription-plans/plan-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditSubscriptionPlanPage({ params }: { params: { publicId: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unwrappedParams = React.use(params as any) as { publicId: string };
  const publicId = unwrappedParams.publicId;

  const { plan, isLoading, error } = useSubscriptionPlanDetails(publicId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E7D4E]" />
        <p className="text-slate-500">جاري تحميل الخطة...</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center max-w-md w-full">
          {error?.message || "لم يتم العثور على خطة الاشتراك"}
        </div>
        <Button variant="outline" asChild>
          <Link href="/subscription-plans">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى القائمة
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href={`/subscription-plans/${publicId}`}>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">تعديل الخطة</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            تحديث بيانات &quot;{plan.name_ar}&quot;
          </p>
        </div>
      </div>

      <PlanForm initialData={plan} />
    </div>
  );
}
